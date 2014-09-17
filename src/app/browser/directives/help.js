angular
  .module( 'sbb.browser' )
  .directive( 'sbbHelp', ['news', 'storage', 'settings',
  function(news, storage, settings) {
    // Activate the help
    return {
      replace: true,
      restrict: 'AE',
      scope: {},
      templateUrl: 'browser/directives/help.html',
      link: function(scope, element) {
        var $el = $(element);

        scope.active = false;

        // Toggles the visibility of the drop down menu
        scope.toggle = function(state, init) {
          scope.active = !scope.active;
          news.setHelp(scope.active);
        };

        // Check if help has been activated somewhere else
        try {
          if (storage.get('helpActive', true) == 1) {
            scope.active = true;
          }
        } catch(e) {}
      }
    };
  }
]);
