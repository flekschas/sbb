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
                $scope.searchError = false;
                $scope.results = data;
                // Cache results for later use
                results[search] = data;
              })
              .error (function (error) {
                $scope.searchError = true;
                news.broadcast('sbbNotification:open', {
                  type: 'error',
                  message: 'API is currently unavailable! Please try again later.'
                });
              });
          }
        }
      });

      // Watch for errors
      $scope.$watch(function () {
        return $location.search().error;
      }, function (newValue, oldValue) {
        if(newValue) {
          news.broadcast('sbbNotification:open', {
            type: 'error',
            message: 'The page you were looking for (' + $location.search().error + ') is not available!'
          });
        }
      });

      $scope.startHelp = function() {
        storage.set('helpActive', 1, true);
        $location.url('human-adult-male-body?unit=liver');
      };

      // Scope is ready
      $scope.app.ready();
    }
  ]);
