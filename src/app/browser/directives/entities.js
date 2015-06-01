angular
  .module('sbb.browser')
  .directive('sbbEntities', ['$timeout', '$', 'news',
  function ($timeout, $, news) {
    // Enables the unit container to updates it height according to the
    // accordion below.
    return function (scope, element) {
      var $el = $(element),
          list = $el.find('ol')[0],
          fn = {},
          i = 0;

      // Listens for when the 'infoHeight' is broad-casted by the news service.
      scope.$on('infoHeight', function () {
        $el.css('bottom', news.infoHeight + 'px');
      });

      scope.$watch('activeUnit', function (newValue, oldValue) {
        var $unit;

        if (newValue) {
          i = 0;
          fn.checkUnit(newValue);
        }
      });

      scope.$on('hoverUnit', function () {
        fn.scrollTo(news.hoverUnit);
      });

      fn.checkUnit = function (unit) {
        i++;
        var $unit = $('#unit_' + unit);
        if ($unit.length) {
          fn.scrollTo(scope.activeUnit, $unit);
        } else {
          if (i <= 10) {
            $timeout(function () {
              fn.checkUnit(unit);
            }, 100);
          }
        }
      };

      fn.scrollTo = function (unit, $unit) {
        var top = $unit.offset().top;
        var height = $el.height();

        /*
         * Offset is relative to the window thus we have to substract 64px of
         * the two topbars. We have to add 27px to make it fully visible (21px
         * for the label + 6px for a bit of padding). We have to add 24px as
         * the units topbar is not part of scolling but adds up to the height
         * of the container -64px + 27px + 24px = -13px.
         */
        if (top - 13 > height) {
          list.scrollTop = list.scrollTop + (top - height - 13);
        } else if (top < 71) {
          list.scrollTop = list.scrollTop - (71 - top);
        }
      };
    };
  }
]);
