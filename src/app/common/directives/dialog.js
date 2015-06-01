angular
  .module('sbb')
  .directive('sbbDialog', [
    '$compile', '$templateCache', '$timeout', '$', 'containElement',  'news',
    function ($compile, $templateCache, $timeout, $, containElement, news) {
      var directive = {
        link: link,
        replace: true,
        restrict: 'E',
        scope: true,
        templateUrl: 'common/directives/dialog.html'
      };

      function link (scope, element, attrs) {
        var $el = $(element),
            $content = $el.find('.content');

        scope
          .$on('sbbDialog:open', function (e, data) {
            var tpl = $templateCache.get(data.tpl);

            if (data.size === 'large') {
              scope.large = true;
            } else {
              scope.large = false;
            }

            scope.content = data.scope;

            scope.show = false;

            if (tpl) {
              $content.html($compile(tpl)(scope));
            }

            $timeout(function () {
              scope.show = true;
            }, 250);
          });

        scope
          .$on('sbbDialog:updateContent', function (e, data) {
            angular.extend(scope.content, data);
          });

        scope.close = function ($event) {
          if (!containElement($content[0], $event.target)) {
            scope.show = false;
          }
        };
      }

      return directive;
    }
  ]);
