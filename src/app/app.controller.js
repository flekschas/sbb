angular
  .module( 'sbb' )
  .controller( 'AppCtrl', ['$scope', '$location', 'news', 'storage',
    function ( $scope, $location, news, storage ) {
      var ctrl = this;

      ctrl.globalClick = function ($event) {
        news.broadcast('click', $event.target);
      };

      ctrl.ready = function() {
        ctrl.status = 'ready';
      };

      $scope
        .$on('$routeChangeStart',
          function(event, currentRoute, previousRoute) {
            ctrl.status = 'loading';

            if (currentRoute.title) {
              // Change page title, based on Route information
              ctrl.title = currentRoute.title;
            } else {
              // Create title out of path
              var words = $location.path().substr(1).split('-');
              for (var i = words.length - 1; i >= 0; i--) {
                words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
              }

              ctrl.title = words.join(' ');
            }

          }
        );

      // Set a current timestamp in days scince 1970
      storage.set('lastVisit', Math.floor(Date.now() / 86400000));
    }
  ]);
