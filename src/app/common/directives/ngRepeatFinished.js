angular
  .module('sbb')
  .directive('ngRepeatFinished', ['$timeout', 'news',
    function ($timeout, news) {
      return {
        restrict: 'A',
        link: function (scope, element, attr) {
          if (scope.$last === true) {
            $timeout(function () {
              news.broadcast('ngRepeatFinished', element);
            });
          }
        }
      };
    }
  ]);
