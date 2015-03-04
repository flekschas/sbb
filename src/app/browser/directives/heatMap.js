angular
  .module( 'sbb.browser' )
  .directive( 'sbbHeatMap', ['genes',
    function (genes) {
      var directive = {
        link: link,
        restrict: 'AE',
        replace: true,
        scope: {},
        templateUrl: 'browser/directives/heatMap.html'
      };

      function link ( scope, element, attrs ) {
        /* *********************************************************************
         * Scope Variables
         **********************************************************************/

        scope.activeTab = 'data';


        /* *********************************************************************
         * Public functions
         * ********************************************************************/

        /*
         * Why is `isActiveTab()` 16x evaluated if openTab is clicked once even
         * though there are only 4 elements?
         */
        scope.isActiveTab = function (tab) {
          return scope.activeTab === tab;
        };

        scope.openTab = function (tab) {
          scope.activeTab = tab;
        };
      }

      return directive;
    }
  ]);
