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
    'errors',
    function(
      $scope,
      $location,
      $window,
      news,
      initData,
      $http,
      settings,
      storage,
      errors) {

      $scope.versions = initData.versions;
      $scope.currentDate = Date.now();

      // Wrapper method for changing the location
      $scope.setLocation = function(url) {
        $location.url(url);
      };

      // Listen for scroll event
      $scope.$on('scrolled', function() {
        $scope.scrolled = news.scrolled;
        if(!$scope.$$phase) {
          $scope.$apply();
        }
      });

      $scope.$on('error:api', function (e, data) {

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
          // $scope.errorHtml = settings.partialsPath + 'error.html';
          $scope.error = true;
          news.broadcast('sbbNotification:open', {
            type: 'error',
            message: 'The page you were looking for (' + $location.search().error + ') is not available!'
          });
        } else if (oldValue) {
          $scope.error = false;
        }
      });

      $scope.hideError = function() {
        $location.search('error', null);
      };

      $scope.startHelp = function() {
        storage.set('helpActive', 1, true);
        $location.url('human-adult-male-body?unit=liver');
      };

      // Scope is ready
      $scope.app.ready();
    }
  ]);
