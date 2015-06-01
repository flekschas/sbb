describe('colours (unit testing)', function () {
  'use strict';

  var colours;

  beforeEach(function () {
    module('colours');

    inject(function (_colours_) {
      colours = _colours_;
    });
  });

  it('should contain the colours service',
    function () {
      expect(colours).not.toEqual(null);
    }
  );

  it('should contain a hexToRgb function',
    function () {
      expect(typeof(colours.hexToRgb)).toEqual('function');
    }
  );

  it('should contain a rgbToHex function',
    function () {
      expect(typeof(colours.rgbToHex)).toEqual('function');
    }
  );

  it('should contain a overlay function',
    function () {
      expect(typeof(colours.overlay)).toEqual('function');
    }
  );

  it('should return `null` for invalid HEX values',
    function () {
      expect(colours.hexToRgb('test')).toEqual(null);
    }
  );

  it('should convert HEX `#ff0000` to RGB `{r:255, g:0, b:0}`',
    function () {
      var hex = '#ff0000',
          rgb = {
            r: 255,
            g: 0,
            b: 0
          };

      expect(colours.hexToRgb(hex)).toEqual(rgb);
    }
  );

  it('should convert RGB object `{r:255, g:0, b:0}` to HEX string `#ff0000`',
    function () {
      var hex = '#ff0000',
          rgb = {
            r: 255,
            g: 0,
            b: 0
          };

      expect(colours.rgbToHex(rgb)).toEqual(hex);
    }
  );

  it('should convert RGB parameters `r:255, g:0, b:0` to HEX string `#ff0000`',
    function () {
      var hex = '#ff0000',
          rgb = {
            r: 255,
            g: 0,
            b: 0
          };

      expect(colours.rgbToHex(rgb.r, rgb.g, rgb.b)).toEqual(hex);
    }
  );

  it('should return bg colour if percent is zero',
    function () {
      var bg = '#ff0000',
          overlay = '#0000ff',
          percent = 0;

      expect(colours.overlay(bg, overlay, percent)).toEqual(bg);
    }
  );

  it('should return ovelay colour if percent is one',
    function () {
      var bg = '#ff0000',
          overlay = '#0000ff',
          percent = 1;

      expect(colours.overlay(bg, overlay, percent)).toEqual(overlay);
    }
  );

  it('should return `#800080` if percent is 0.5',
    function () {
      var bg = '#ff0000',
          overlay = '#0000ff',
          mix = '#7f007f',
          percent = 0.5;

      expect(colours.overlay(bg, overlay, percent)).toEqual(mix);
    }
  );

});
