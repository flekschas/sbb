angular
  .module( 'sbb.legals' )
  .controller( 'LegalsCtrl', [ '$scope',
    function(
      $scope) {
      // Scope is ready
      $scope.app.ready();
    }
  ]);
