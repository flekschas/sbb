angular
  .module('sbb.browser')
  .directive('sbbDevStages', ['$', 'news', 'settings',
  function ($, news, settings) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        setLocation: '&',
        species: '@',
        gender: '@',
        similarViews: '='
      },
      templateUrl: 'browser/directives/devStages.html',
      link: function (scope, element) {
        var $el = $(element);

        scope.open = false;

        // Count number of different developmental stages
        scope.$watch('similarViews', function (value) {
          if (value) {
            scope.differentStages = [];

            for (var i = 0; i < value.length; ++i) {
              var tmp = {};
              if (value[i].species === scope.species &&
                  (value[i].gender === scope.gender || (value[i].gender === null && !scope.gender.length))) {
                tmp.name = value[i].name.replace(/human|mouse/gi, '').replace('-', ' ');
                tmp.path = value[i].name;
                tmp.stage = value[i].stage;
                scope.differentStages.push(tmp);
              }
            }

            if (scope.differentStages.length > 1) {
              scope.stageEnabled = true;
            } else {
              scope.stageEnabled = false;
            }
          }
        });

        // Listens for the global click event broad-casted by the news service
        scope.$on('click', function (e, target) {
          while (target && target.tagName.toLowerCase() != 'body') {
            if (target.attributes.getNamedItem('sbb-dev-stages')) {
              return;
            }
            target = target.parentNode;
          }
          scope.open = false;
        });

        scope.toggle = function () {
          scope.open = !scope.open;
        };

        scope.isOpen = function () {
          return scope.stageEnabled && scope.open;
        };
      }
    };
  }
]);
