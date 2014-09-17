angular
  .module( 'sbb' )
  .directive ( 'sbbAbout', ['$', 'news', 'settings',
  function ($, news, settings) {
    return {
      restrict: 'AE',
      templateUrl: 'common/directives/sbbAbout.html',
      scope: true,
      link: function(scope, element) {
        var $el = $(element),
            opened = true;

        // Toggles the visibility of the drop down menu
        scope.toggle = function(state) {
          opened = (typeof state === 'undefined') ? !opened : state;
          $el.removeClass(opened ? 'closed' : 'opened');
          $el.addClass(opened ? 'opened' : 'closed');

        };

        // Listens for the global click event broad-casted by the news
        // service
        scope.$on('click', function() {
          if ($el.find(news.clickTarget.tagName)[0] !== news.clickTarget) {
            scope.toggle(false);
          }
        });

        // Init
        scope.toggle();
      }
    };
  }
]);
