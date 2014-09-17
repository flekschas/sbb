angular
  .module( 'sbb.browser' )
  .directive( 'helpMessage', [
  function() {
    return {
      restrict: 'A',
      scope: {
        closeHelpMessage: '&'
      },
      link: function(scope, element) {
        scope.close = function(event) {
          if (event) {
            if (element[0].id === event.target.id) {
              setTimeout(scope.closeHelpMessage(), 2000);
            }
          } else {
            setTimeout(scope.closeHelpMessage(), 2000);
          }
        };
      }
    };
  }
]);
