'use strict';

angular
    .module('sbb.services', [])
    .factory('News', ['$rootScope', function($rootScope) {
        var news = {};

        // Sets and broadcasts the active unit
        news.setActiveUnit = function( unit ) {
            this.activeUnit = unit;
            $rootScope.$broadcast('activeUnit');
        };

        // Sets and broadcasts the target of a global click
        news.setClick = function( target ) {
            this.clickTarget = target;
            $rootScope.$broadcast('click');
        };

        // Sets and broadcasts the target of a global click
        news.setScrolled = function( status ) {
            this.scrolled = status;
            $rootScope.$broadcast('scrolled');
        };

        // Sets and broadcasts the height of the accordion
        news.setInfoHeight = function( height ) {
            this.infoHeight = height;
            $rootScope.$broadcast('infoHeight');
        };

        // Sets and broadcasts the help
        news.setHelp = function( help ) {
            this.help = help;
            $rootScope.$broadcast('help');
        };

        // Sets and broadcasts the active panel
        news.setActivePanel = function( panel ) {
            this.activePanel = panel;
            $rootScope.$broadcast('activePanel');
        };

        // Sets and broadcasts the active width
        news.setSliderWidth = function( width ) {
            this.sliderWidth = width;
            $rootScope.$broadcast('sliderWidth');
        };

        // Generic broadcast function
        news.broadcast = function( event, data, extra) {
            $rootScope.$broadcast( event, data, extra);
        };

        return news;
    }])
    .factory('Spinner', function() {
        var spinner = function(paper, containerWidth, containerHeight, R1, R2, count, stroke_width, colour) {
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
                pathParams = { stroke: color, "stroke-width": width, "stroke-linecap": "round" };

            Raphael.getColor.reset();

            var i = sectorsCount
            while (i--) {
                var alpha = beta * i - Math.PI / 2,
                    cos = Math.cos(alpha),
                    sin = Math.sin(alpha);
                opacity[i] = 1 / sectorsCount * i;
                sectors[i] = paper.path([["M", cx + r1 * cos, cy + r1 * sin], ["L", cx + r2 * cos, cy + r2 * sin]]).attr(pathParams);
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
                if( k <= sectorsCount) tick = setTimeout(ticker, 500 / sectorsCount);
            })();

            return function () {
                clearTimeout(tick);
            };
        }

        return spinner;
    })
    .factory('SBBStorage', function () {
        var session = {};
        return {
            set: function (key, value, sessionOnly) {
                try {
                    if (sessionOnly) {
                        session[key] = value;
                    } else {
                        localStorage.setItem('SBB/' + key, JSON.stringify(value));
                    }
                    return true;
                } catch(e) {
                    return false;
                }
            },
            get: function (key, sessionOnly) {
                try {
                    if (sessionOnly) {
                        return session[key];
                    } else {
                        var value = localStorage.getItem('SBB/' + key);
                        return (value && JSON.parse(value));
                    }
                } catch(e) {
                    return false;
                }
            },
            enabled: function () {
                try {
                    localStorage.setItem(mod, mod);
                    localStorage.removeItem(mod);
                    return true;
                } catch(e) {
                    return false;
                }
            }
        }
    })
    .factory('StringWidth', function () {
        return function (string, font) {
            var f = font || '12px arial',
            o = $('<div>' + string + '</div>')
                .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
                .appendTo($('body')),
            w = o.width();

            o.remove();

            return w;
        }
    })
    .factory('ContainEl', function () {
        return function (parentEl, searchEl) {
            var found = false;

            // Set special attribute to identify element while browsing up the
            // dom tree.
            parentEl.setAttribute('SBBSEARCH', true);

            var target = searchEl;
            while (target.tagName.toLowerCase() != 'body') {
                if (target.attributes.getNamedItem('SBBSEARCH')) {
                    found = true;
                    break;
                }
                target = target.parentNode;
            }

            // Remove special search attribute
            parentEl.removeAttribute('SBBSEARCH');

            return found;
        }
    })
    .factory('Colors', function () {
        var colors = {};

        colors.hexToRgb = function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ?  {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        colors.rgbToHex = function (r, g, b) {
            if (typeof r === 'object') return '#' + ((1 << 24) + (r.r << 16) + (r.g << 8) + r.b).toString(16).slice(1);
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        colors.overlay = function(bg, overlay, percent) {
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

        return colors;
    });