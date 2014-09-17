angular
  .module( 'colours', [])
  .factory( 'colours', [
    function() {
      return {
        hexToRgb: function (hex) {
          var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ?  {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : null;
        },
        rgbToHex: function (r, g, b) {
          if (typeof r === 'object') {
            return '#' + ((1 << 24) + (r.r << 16) + (r.g << 8) + r.b).toString(16).slice(1);
          }
          return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },
        overlay: function(bg, overlay, percent) {
          if (bg && bg !== 'none') {

            bg = this.hexToRgb(bg);
            overlay = this.hexToRgb(overlay);

            return this.rgbToHex({
              r: parseInt(bg.r * (1 - percent) + overlay.r * percent),
              g: parseInt(bg.g * (1 - percent) + overlay.g * percent),
              b: parseInt(bg.b * (1 - percent) + overlay.b * percent)
            });
          }
        }
      };
    }
  ]);
