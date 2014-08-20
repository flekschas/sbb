'use strict';

var sbbServices = angular.module('sbb.services', []);

sbbServices.factory('News', [
    '$rootScope',
    function($rootScope) {
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
    }
]);

sbbServices.factory('Spinner', [
    function() {
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
    }
]);

sbbServices.factory('SBBStorage', [
    function () {
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
    }
]);

sbbServices.factory('StringWidth', [
    function () {
        return function (string, font) {
            var f = font || '12px arial',
            o = $('<div>' + string + '</div>')
                .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
                .appendTo($('body')),
            w = o.width();

            o.remove();

            return w;
        }
    }
]);

sbbServices.factory('ContainEl', [
    function () {
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
    }
]);

sbbServices.factory('Colors', [
    function() {
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
    }
]);

sbbServices.factory('versionService', ['$q', '$http', 'settings',
    function($q, $http, settings) {
        return {
            getVersions: function() {
                var deferred = $q.defer();

                $http
                    .get(settings.apiPath + 'versions')
                    .success(function (data) {
                        deferred.resolve(data);
                    })
                    .error(function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            },
            getChangelog: function() {
                var deferred = $q.defer();

                $http
                    .get(settings.apiPath + 'changelog')
                    .success(function (data) {
                        var changelog = {};
                        for (var i = data.length; i--;) {
                            if (typeof changelog[data[i].version] !== 'undefined'){
                                changelog[data[i].version].push(data[i]);
                            } else {
                                changelog[data[i].version] = [data[i]];
                            }
                        }
                        deferred.resolve(changelog);
                    })
                    .error(function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            }
        }
    }
]);

sbbServices.factory('homeInitData', ['$q', 'versionService',
    function($q, versionService) {
        return function() {
            var versions = versionService.getVersions();

            return $q.all([versions]).then(function(results) {
                return {
                    changelog: null,
                    versions: results[0]
                };
            });
        }
    }
]);

sbbServices.factory('aboutInitData', ['$q', 'versionService',
    function($q, versionService) {
        return function() {
            var changelog = versionService.getChangelog();
            var versions = versionService.getVersions();

            return $q.all([changelog, versions]).then(function(results) {
                return {
                    changelog: results[0],
                    versions: results[1]
                };
            });
        }
    }
]);

sbbServices.factory('isMobile', [
    function() {
        /**
         * isMobile.js v0.3.2
         *
         * A simple library to detect Apple phones and tablets,
         * Android phones and tablets, other mobile devices (like blackberry, mini-opera and windows phone),
         * and any kind of seven inch device, via user agent sniffing.
         *
         * @author: Kai Mallea (kmallea@gmail.com)
         *
         * @license: http://creativecommons.org/publicdomain/zero/1.0/
         */

        var apple_phone      = /iPhone/i,
            apple_ipod       = /iPod/i,
            apple_tablet     = /iPad/i,
            android_phone    = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i, // Match 'Android' AND 'Mobile'
            android_tablet   = /Android/i,
            windows_phone    = /IEMobile/i,
            windows_tablet   = /(?=.*\bWindows\b)(?=.*\bARM\b)/i, // Match 'Windows' AND 'ARM'
            other_blackberry = /BlackBerry/i,
            other_opera      = /Opera Mini/i,
            other_firefox    = /(?=.*\bFirefox\b)(?=.*\bMobile\b)/i, // Match 'Firefox' AND 'Mobile'
            seven_inch = new RegExp(
                '(?:' +         // Non-capturing group
                'Nexus 7' +     // Nexus 7
                '|' +           // OR
                'BNTV250' +     // B&N Nook Tablet 7 inch
                '|' +           // OR
                'Kindle Fire' + // Kindle Fire
                '|' +           // OR
                'Silk' +        // Kindle Fire, Silk Accelerated
                '|' +           // OR
                'GT-P1000' +    // Galaxy Tab 7 inch
                ')',            // End non-capturing group
                'i');           // Case-insensitive matching

        var match = function(regex, userAgent) {
            return regex.test(userAgent);
        };

        var IsMobileClass = function(userAgent) {
            var ua = userAgent || navigator.userAgent;

            this.apple = {
                phone:  match(apple_phone, ua),
                ipod:   match(apple_ipod, ua),
                tablet: match(apple_tablet, ua),
                device: match(apple_phone, ua) || match(apple_ipod, ua) || match(apple_tablet, ua)
            };
            this.android = {
                phone:  match(android_phone, ua),
                tablet: !match(android_phone, ua) && match(android_tablet, ua),
                device: match(android_phone, ua) || match(android_tablet, ua)
            };
            this.windows = {
                phone:  match(windows_phone, ua),
                tablet: match(windows_tablet, ua),
                device: match(windows_phone, ua) || match(windows_tablet, ua)
            };
            this.other = {
                blackberry: match(other_blackberry, ua),
                opera:      match(other_opera, ua),
                firefox:    match(other_firefox, ua),
                device:     match(other_blackberry, ua) || match(other_opera, ua) || match(other_firefox, ua)
            };
            this.seven_inch = match(seven_inch, ua);
            this.any = this.apple.device || this.android.device || this.windows.device || this.other.device || this.seven_inch;
            // excludes 'other' devices and ipods, targeting touchscreen phones
            this.phone = this.apple.phone || this.android.phone || this.windows.phone;
            // excludes 7 inch devices, classifying as phone or tablet is left to the user
            this.tablet = this.apple.tablet || this.android.tablet || this.windows.tablet;

            if (typeof window === 'undefined') {
                return this;
            }
        };

        var instantiate = function() {
            var IM = new IsMobileClass();
            IM.Class = IsMobileClass;
            return IM;
        };

        return  instantiate();
    }
]);
