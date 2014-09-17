angular
  .module( 'sbb.browser' )
  .directive( 'sbbZoom', ['$', 'storage', 'news', 'settings',
    function($, storage, news, settings) {
      // Drop down menu for changing the resolution, meaning to zoom in or out
      return {
        restrict: 'AE',
        templateUrl: 'browser/directives/zoom.html',
        scope: {
          setLocation: '&',
          level: '@',
          species: '@',
          stage: '@',
        },
        link: function(scope, element) {
          var $el = $(element),
              opened = true;

          // Toggles the visibility of the drop down menu
          scope.toggle = function(state, init) {
            opened = (typeof state === 'undefined') ? !opened : state;
            $el.removeClass(opened ? 'closed' : 'opened');
            $el.addClass(opened ? 'opened' : 'closed');
          };

          scope.goto = function(level) {
            var gender = '';

            if (level === 'body' && scope.species == 'human') {
              gender = storage.get('gender', true);
              if (!gender) {
                if (Math.random() > 0.5) {
                  gender = 'male';
                } else {
                  gender = 'female';
                }
              }
              gender += '-';
            }

            scope.setLocation({
              'url': scope.species + '-adult-' + gender + level
            });
          };

          // Listens for the global click event broad-casted by the news service
          scope.$on('click', function() {
            if ($el.find(news.clickTarget.tagName)[0] !== news.clickTarget) {
              scope.toggle(false);
            }
          });

          // Init
          scope.toggle(undefined, true);
        }
      };
    }
  ]);
