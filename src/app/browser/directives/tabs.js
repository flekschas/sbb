angular
  .module('sbb.browser')
  .directive('sbbTabs', [
    function () {
      var directive = {
        link: link,
        restrict: 'E',
      };

      function link (scope, element, attrs) {
        /*
         * ---------------------------------------------------------------------
         * Scope Variables
         * ---------------------------------------------------------------------
         */
        scope.activeTab = 'data';

        /*
         * ---------------------------------------------------------------------
         * Public functions
         * ---------------------------------------------------------------------
         */
        scope.sbbActiveTab = function (tab) {
          return scope.activeTab === tab;
        };

        scope.sbbOpenTab = function (tab) {
          console.log(tab);
        };
      }

      return directive;
    }
  ]);
