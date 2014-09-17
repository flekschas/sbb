angular
  .module( 'sbb.about' )
  .controller( 'AboutCtrl', [
    '$scope', '$location', '$window', 'news', 'initData',
    function ( $scope, $location, $window, news, initData ) {

      $scope.changelog = initData.changelog;
      $scope.versions = initData.versions;
      $scope.currentDate = Date.now();

      // Wrapper method for changing the location
      $scope.setLocation = function ( url ) {
        $location.url(url);
      };

      // Helper method to hide email in HTML
      $scope.mail = function() {
        $window.location = 'mailto:fritz.lekschas@charite.de?subject=[SBB]';
      };

      // Listen for scroll event
      // Note that activeUnit is only the name of the notification the news
      // service broadcasts
      $scope.$on('scrolled', function () {
        $scope.scrolled = news.scrolled;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });

      // Scope is ready
      $scope.app.ready();
    }
  ]);
