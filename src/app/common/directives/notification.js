angular
  .module( 'sbb' )
  .directive ( 'sbbNotification', [
    '$compile', '$templateCache', '$timeout',
    function ($compile, $templateCache, $timeout) {
      var directive = {
        link: link,
        replace: true,
        restrict: 'E',
        scope: true,
        templateUrl: 'common/directives/notification.html'
      };

      function link ( scope, element, attrs ) {
        var contentEl = angular.element(element[0].querySelector('.content'));

        scope.show = false;

        scope
          .$on('sbbNotification:open', function (e, data) {
            setType(data.type);

            scope.message = data.message;
            scope.show = true;
          });

        scope
          .$on('sbbNotification:close', function () {
            scope.close();
          });

        scope.close = function () {
          scope.show = false;
        };

        function setType (type) {
          switch (type) {
            case 'error':
              scope.type = 'error';
              scope.icon = 'warning';
              break;
            case 'success':
              scope.type = 'success';
              scope.icon = 'checkmark-circle';
              break;
            default:
              scope.type = 'info';
              scope.icon = 'info-circle';
              break;
          }
        }
      }

      return directive;
    }
  ]);
