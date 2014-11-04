angular
  .module( 'sbb.browser' )
  .directive( 'sbbChosen', [
    '$compile', '$sce', '$timeout', '$', 'stringWidth', 'news',
    function($compile, $sce, $timeout, $, stringWidth, news) {
      return {
        restrict: 'E',
        scope: {
          data: '=',
          selection: '=',
          min: '@',
          max: '@'
        },
        templateUrl: 'browser/directives/chosen.html',
        link: function(scope, element, attrs) {
          var $el = $(element),
              fn = {},
              cachedHits = {},
              dataLength = 0,
              limit = parseInt(attrs.limit, 10),
              $selection = $el.find('ul.selection'),
              $hits = $el.find('ul.hits'),
              hitsHeight,
              hitsOffsetTop,
              bodyFont = $('body').css('font-family'),
              hitsFontSize = $hits.css('font-size'),
              hitsFontSizePx = parseInt($hits.css('font-size').slice(0, -2), 10);

          scope.limit = limit;
          scope.hits = [];
          scope.prevNeedle = null;
          scope.preselection = [{}];
          scope.noResultsText = attrs.noResults;

          scope.$watch('selection', function () {
            fn.select(scope.selection, true);
          });

          scope.$on('ngRepeatFinished', function(e, el) {
            // Listen for when the selection ngRepeat finished rendering
            // Then set the top margin for the ul.hits equal to the
            // ul.selection height
            if (el.parent().hasClass('selection')) {
              var outerHeight = $selection.outerHeight(),
                liHeight = $selection.find('li:first').outerHeight();

              // Check of outerHeight does not respond to the real
              // height because of min-height 50%
              if(outerHeight < liHeight) {
                $hits.css('top', outerHeight + liHeight);
              } else {
                $hits.css('top', outerHeight);
              }
            }

            // Set current height of the hits list and update shadow
            if (el.parent().hasClass('hits')) {
              hitsHeight = $hits.outerHeight();
              hitsOffsetTop = $hits.offset().top;
              fn.checkShadow();
            }

          });

          // Whatch for source data
          scope.$watch('data', function(newValue) {
            if (newValue && newValue.length) {
              // Enable chosen
              dataLength = newValue.length;
            }
          });

          // Whatch for the selection to be reset
          scope.$watch(function() {
            return scope.selection.length;
          }, function(newValue, oldValue) {
            if (!newValue && oldValue && scope.preselection.length > 1) {
              scope.preselection = [{}];
            }
          });

          scope.placeholder = function (first) {
            return first ? attrs.placeholder : '';
          };

          scope.focusLatest = function () {
            $timeout(function(){
              $selection.find('li:last input')[0].focus();
            });
          };

          scope.inputKeyUp = function ($event) {
            switch ($event.keyCode) {
              case 8:
                // Backspace
                $event.preventDefault();
                fn.search($event.target.value);
                fn.inputWidth($event.target);
                break;
              case 9:
                // Tab
                fn.select();
                $event.preventDefault();
                break;
              case 13:
                // Enter
                fn.select();
                $event.preventDefault();
                break;
              case 38:
                // Arrow Up
                $event.preventDefault();
                fn.checkScrollPos();
                break;
              case 40:
                // Arrow Down
                $event.preventDefault();
                fn.checkScrollPos();
                break;
              default:
                fn.search($event.target.value);
                fn.inputWidth($event.target, true);
            }
          };

          scope.inputKeyDown = function ($event) {
            switch ($event.keyCode) {
              case 8:
                // Backspace
                if (!$event.target.value.length) {
                  // Option is already empty so delete previous
                  // selection
                  fn.deselect();
                  $event.preventDefault();
                }
                break;
              case 9:
                // Tab
                if (scope.hits.length) {
                  fn.select();
                  $event.preventDefault();
                }
                break;
              case 38:
                // Arrow Up
                $event.preventDefault();
                if (scope.selected > 0) {
                  --scope.selected;
                }
                break;
              case 40:
                // Arrow Down
                $event.preventDefault();
                if (scope.selected < (scope.hits.length - 1)) {
                  if (scope.selected + 2 === scope.limit) {
                    scope.limit += limit;
                  }
                  ++scope.selected;
                }
                break;
              default:
                fn.inputWidth($event.target, true);
            }
          };

          scope.select = function ($event) {
            fn.select($($event.currentTarget));
          };

          scope.deselect = function ($index) {
            fn.deselect($index);
          };

          scope.hover = function (index) {
            scope.selected = index;
          };

          scope.setGeneExample = function (id) {
            switch (id) {
              case 'liver':
                fn.select(['ALB', 'CYP1A2', 'CYP2B6', 'GJB1', 'SERPINA1'], true);
                break;
              case 'kidney':
                fn.select(['CD24', 'GGT1', 'NPHS1', 'NPHS2', 'PAX2'], true);
                break;
            }
          };

          scope.noResults = function () {
            if (!scope.hits.length && $selection.find('li:last input').val().length > 1) {
              return true;
            }
            else {
              return false;
            }
          };

          scope.selectSingleGene = function (index) {
            if (scope.selectedGene === index) {
              index = undefined;
            }
            news.broadcast('singleGene', index, scope.selection[index]);
          };

          scope.alreadySelected = function (needle) {
            return (scope.selection.indexOf(needle) >= 0);
          };

          scope.$on('singleGene', function(e, index) {
            scope.selectedGene = index;
          });

          $hits.on('scroll', function (e) {
            // Check if we scrolled to the bottom
            if ((e.currentTarget.scrollTop + 5) >= (e.currentTarget.scrollHeight - e.currentTarget.offsetHeight)) {
              if (scope.hits.length > scope.limit) {
                scope.limit += limit;
              }
            }
          });

          /*
           * Private functions
           */

          fn.search = function (needle) {
            needle = needle.toUpperCase();
            var needleLength = needle.length;
            if (needleLength > 1) {
              var i,
                pos,
                tmp = [];

              // Set selected option to be the first
              scope.selected = 0;

              // Check if hits are cached
              if (typeof cachedHits[needle] !== 'undefined' && cachedHits[needle].length) {
                scope.hits = cachedHits[needle];
                return;
              }

              // Check if needle has only been extended
              // So the previous needle should be a prefix of the current needle
              if ( needle.indexOf(scope.prevNeedle) === 0 ) {
                i = scope.hits.length;
                while (i--) {
                  if ( (pos = scope.hits[i].value.indexOf(needle)) >= 0 ) {
                    tmp.push({
                      value: scope.hits[i].value,
                      with_hit: $sce.trustAsHtml(scope.hits[i].value.substr(0, pos) + '<u>' + scope.hits[i].value.substr(pos, needleLength) + '</u>' + scope.hits[i].value.substr(pos + needleLength))
                    });
                  }
                }
              } else {
                i = dataLength;
                while (i--) {
                  if ( (pos = scope.data[i].indexOf(needle)) >= 0 ) {
                    tmp.push({
                      value: scope.data[i],
                      with_hit: $sce.trustAsHtml(scope.data[i].substr(0, pos) + '<u>' + scope.data[i].substr(pos, needleLength) + '</u>' + scope.data[i].substr(pos + needleLength))
                    });
                  }
                }
              }

              // Reset limit to its original value
              scope.limit = limit;

              scope.hits = tmp;
              scope.prevNeedle = needle;

              fn.checkShadow();

              // Cache hits
              if (typeof cachedHits[needle] === 'undefined') {
                cachedHits[needle] = tmp;
              }
            } else {
              fn.clear();
            }
          };

          fn.checkShadow = function (forceRemoval) {
            if(!forceRemoval && $hits[0].scrollHeight > hitsHeight) {
              $selection.addClass('shadow');
            } else {
              $selection.removeClass('shadow');
            }
          };

          fn.inputWidth = function (el, offset) {
            if (el.value.length > 2) {
              if (offset) {
                offset = hitsFontSizePx;
              } else {
                offset = 0;
              }
              $(el).css('width', stringWidth(el.value, hitsFontSize + ' ' + bodyFont) + offset);
            } else {
              $(el).css('width', '');
            }
          };

          fn.select = function (el, valueOnly) {
            var value;

            if (valueOnly) {
              value = el;
            } else {
              // Search for the selected option or choose the first
              // option of the hits of nothing has been selected
              if (!el) {
                el = $el.find('ul.hits li.selected');
                if (!el.length) {
                  el = $el.find('ul.hits li:first');
                }
              }

              if (!el.length) {
                // Nothing found
                return;
              }

              value = el.data('value');
            }


            if (Object.prototype.toString.call( value ) === '[object Array]') {
              // Multi-select
              var tmp = [],
                  len = value.length;

              for (var i = 0; i < len; ++i) {
                // Check if value is already selected
                if (scope.preselection.indexOf(value[i]) === -1) {
                  tmp.push({'value': value[i], 'ready': 1});
                }
              }
              tmp.push({});

              scope.preselection = tmp;
              scope.selection = value;
            } else  {
              // Single-select
              // Check if value is already selected
              try {
                if (scope.selection.indexOf(value) === -1) {
                  scope.selection.push(value);
                }
              } catch(e) {

              }
              scope.preselection[scope.preselection.length - 1].value = value;
              scope.preselection[scope.preselection.length - 1].ready = 1;
              scope.preselection.push({});
            }

            scope.$on('ngRepeatFinished', function() {
              // When ngRepeat finished rendering focus the last
              // (new) input
              scope.focusLatest();
            });

            fn.clear();
          };

          fn.deselect = function (index) {
            if (typeof index === 'number') {
              scope.preselection.splice(index, 1);
              scope.selection.splice(index, 1);
            } else {
              if (scope.preselection.length < 2) {
                scope.preselection[0].value = null;
              } else {
                scope.preselection.pop();
                scope.preselection.pop();
                scope.preselection.push({});
              }
              scope.selection.pop();
            }
            if (scope.selectedGene > 0 && scope.selectedGene === index) {
              news.broadcast('singleGene', undefined);
            }
          };

          fn.clear = function(){
            scope.hits = [];
            scope.prevNeedle = null;
            scope.limit = limit;
            fn.checkShadow(true);
          };

          fn.checkScrollPos = function() {
            var el = $hits.find('li.selected'),
              elHeight = el.outerHeight(),
              elOffsetTop = el.offset().top;

            if (elOffsetTop - hitsOffsetTop < 0) {
              $hits.scrollTop($hits.scrollTop() + elOffsetTop - hitsOffsetTop);
            }

            // Scroll down
            if (elOffsetTop - hitsOffsetTop + elHeight > hitsHeight) {
              $hits.scrollTop($hits.scrollTop() + elOffsetTop - hitsOffsetTop + elHeight - hitsHeight);
            }
          };
        }
      };
    }
  ]);
