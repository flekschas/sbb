angular
  .module('sbb.browser')
  .directive('sbbSpecies', ['$location', '$', 'news', 'storage', 'settings',
  function ($location, $, news, storage, settings) {
    return {
      restrict: 'AE',
      templateUrl: 'browser/directives/species.html',
      scope: {
        setLocation: '&',
        currentSpecies: '@',
        stage: '@',
        similarViews: '='
      },
      link: function (scope, element) {
        var $el = $(element),
            opened = true;

        scope.enabled = null;

        scope.speciesClass = function () {
          console.log('icon-' + scope.currentSpecies);
          return 'icon-' + scope.currentSpecies;
        };

        // Toggles the visibility of the drop down menu
        scope.toggle = function (state, init) {
          if (scope.enabled || init) {
            opened = (typeof state === 'undefined') ? !opened : state;
            $el.removeClass(opened ? 'closed' : 'opened');
            $el.addClass(opened ? 'opened' : 'closed');
          }
        };

        // Look for views of different species with the same developmental stage
        scope.$watch('similarViews', function (value) {
          if (value) {
            var count = 0;
            scope.allSpecies = {};

            for (var i = value.length; i--;) {
              if (value[i].stage === scope.stage) {
                if (typeof scope.allSpecies[value[i].species] !== 'undefined') {
                  // Check whether we found a prefered gender
                  // otherwise ignore
                  if (value[i].gender === storage.get('gender', true)) {
                    scope.allSpecies[value[i].species] = value[i];
                  }
                } else {
                  scope.allSpecies[value[i].species] = value[i];
                }
                ++count;
              }
            }

            if (count > 1) {
              scope.enabled = true;
            }
          }
        });

        // Listens for the global click event broad-casted by the news service
        scope.$on('click', function (e, target) {
          if ($el.find(target.tagName)[0] !== target) {
            scope.toggle(false);
          }
        });

        scope.changeSpecies = function (name) {
          if (name != scope.currentSpecies) {
            scope.setLocation({url: name, keepActiveUnit: true});
          }
        };

        // Init
        scope.toggle(undefined, true);
      }
    };
  }
]);
