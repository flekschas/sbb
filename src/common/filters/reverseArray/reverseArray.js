angular
  .module('reverseArray', [])
  .filter('reverseArray', [
    function () {
      return function (items) {
        if (angular.isArray(items)) {
          return items.slice().reverse();
        }
      };
    }
  ]);
