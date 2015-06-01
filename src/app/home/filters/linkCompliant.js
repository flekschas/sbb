angular
  .module('sbb.home')
  .filter('linkCompliant', [
    function () {
      // Reformat view and unit names
      // Split at '-' and capitalize
      return function (s) {
        if (typeof s === 'string') {
          return s.replace(/\s/g, '-');
        }
      };
    }
  ]);
