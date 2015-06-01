angular
  .module('stringWidth', [])
  .factory('stringWidth', ['$',
    function ($) {
      return function (string, font) {
        var element = $('<div>' + string + '</div>')
              .css({
                'position': 'absolute',
                'float': 'left',
                'white-space': 'nowrap',
                'visibility': 'hidden',
                'font': (font || '12px arial')
              })
              .appendTo($('body')),
            width = element.width();

        element.remove();

        return width;
      };
    }
  ]);
