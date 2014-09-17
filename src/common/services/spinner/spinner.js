angular
  .module( 'SbbSpinner', [])
  .factory( 'SbbSpinner', ['$timeout', 'Raphael',
    function( $timeout, Raphael ) {
      return function SbbSpinner (paper, containerWidth, containerHeight, R1, R2,
                               count, stroke_width, colour) {
        var sectorsCount = count || 12,
            color = colour || "#303030",
            width = stroke_width || 4,
            r1 = Math.min(R1, R2) || 32,
            r2 = Math.max(R1, R2) || 18,
            cx = r2 + width + (containerWidth / 2),
            cy = r2 + width + (containerHeight / 2),
            sectors = [],
            opacity = [],
            beta = 2 * Math.PI / sectorsCount,
            pathParams = {
              "stroke": color,
              "stroke-width": width,
              "stroke-linecap": "round"
            };

        Raphael.getColor.reset();

        var i = sectorsCount;
        while (i--) {
          var alpha = beta * i - Math.PI / 2,
            cos = Math.cos(alpha),
            sin = Math.sin(alpha);
          opacity[i] = 1 / sectorsCount * i;
          sectors[i] = paper.path([
            ["M", cx + r1 * cos, cy + r1 * sin],
            ["L", cx + r2 * cos, cy + r2 * sin]
          ]).attr(pathParams);
        }

        opacity[opacity.length - 1] = 1;

        var tick;
        var k = 0;

        (function ticker() {
          opacity.unshift(opacity.pop());
          var i = sectorsCount;
          while (i--) {
            sectors[i].attr("opacity", opacity[i]);
          }
          paper.safari();
          if( k <= sectorsCount) {
            tick = $timeout(ticker, 500 / sectorsCount);
          }
        })();

        return function () {
          $timeout.cancel( tick );
        };
      };
    }
  ]);
