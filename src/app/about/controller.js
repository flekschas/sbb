angular
  .module( 'sbb.about' )
  .controller( 'AboutCtrl', [
    '$scope', '$location', '$window', 'news', 'initData',
    function ( $scope, $location, $window, news, initData ) {

      $scope.changelog = initData.changelog;
      $scope.versions = initData.versions;
      $scope.currentDate = Date.now();

      // Helper method to hide email in HTML
      $scope.mail = function() {
        $window.location = 'mailto:fritz.lekschas@charite.de?subject=[SBB]';
      };

      // Scope is ready
      $scope.app.ready();
    }
  ]);
