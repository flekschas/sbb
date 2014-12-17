angular
  .module( 'sbb' )
  .directive ( 'sbbAbout', ['$', 'news', 'containElement',
  function ($, news, containElement) {
    return {
      restrict: 'AE',
      templateUrl: 'common/directives/sbbAbout.html',
      scope: true,
      link: function(scope, element) {
        scope.open = false;

        scope.toggle = function () {
          scope.open = !scope.open;
        };

        // Listens for the global click event broad-casted by the news
        // service
        scope.$on('click', function(e, target) {
          if (!containElement(element[0], target)) {
            scope.open = false;
          }
        });
      }
    };
  }
]);
