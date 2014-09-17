angular
  .module( 'sbb.home' )
  .controller( 'HomeCtrl', [
    '$scope',
    '$location',
    '$window',
    'news',
    'initData',
    '$http',
    'settings',
    'storage',
    function(
      $scope,
      $location,
      $window,
      news,
      initData,
      $http,
      settings,
      storage) {

      $scope.versions = initData.versions;
      $scope.currentDate = Date.now();

      // Wrapper method for changing the location
      $scope.setLocation = function(url) {
        $location.url(url);
      };

      // Listen for scroll event
      // Note that activeUnit is only the name of the notification the news
      // service broadcasts
      $scope.$on('scrolled', function() {
        $scope.scrolled = news.scrolled;
        if(!$scope.$$phase) {
          $scope.$apply();
        }
      });

      // Watch for the search to change
      // Cache results for more speed
      var results = {};
      $scope.$watch(function() {
        return $scope.searchInput;
      }, function(search) {
        if (typeof search !== 'undefined' && search.length) {
          // Check for cached results
          if (typeof results[search] !== 'undefined') {
            $scope.results = results[search];
          } else {
            $http
              .get (settings.apiPath + 's/' + search)
              .success (function (data) {
                $scope.results = data;
                // Cache results for later use
                results[search] = data;
                console.log(settings.apiPath + 's/' + search, data);
              })
              .error (function (error) {
                if (console) {
                  console.log('Data for searching could not have been loaded!');
                }
              });
          }
        }
      });

      // Watch for errors
      $scope.$watch(function () {
        return $location.search().error;
      }, function (newValue, oldValue) {
        if(newValue) {
          $scope.errorHtml = settings.partialsPath + 'error.html';
          $scope.error = true;
          $scope.errorPath = $location.search().error;
        } else if (oldValue) {
          $scope.error = false;
        }
      });

      // If visited first time please display introduction information
      // Date return milliseconds. To boil this down to days we have to devide
      // by 1000 (ms->s) * 60 (s->min) * 60 (min->std) * 24 (std->day)
      // If the last visit is 30 days ago then show the message again.
      if (storage.enabled() && (!storage.get('lastVisit') || Math.floor(Date.now() / 86400000) - storage.get('lastVisit') > 30)) {
        $scope.helpHtml = settings.partialsPath + 'help/home.html';
        $scope.help = true;
      }

      $scope.hideError = function() {
        $location.search('error', null);
      };

      $scope.hideHelp = function() {
        $scope.help = false;
      };

      $scope.startHelp = function() {
        storage.set('helpActive', 1, true);
        $location.url('human-adult-male-body?unit=liver');
      };

      // Scope is ready
      $scope.app.ready();
    }
  ]);
