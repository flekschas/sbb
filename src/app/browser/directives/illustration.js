angular
  .module( 'sbb.browser' )
  .directive( 'sbbIllustration', [
    '$http', '$window', '$', 'news', 'SbbSpinner', 'settings', 'containElement',
    'colours', 'isMobile',
    function($http, $window, $, news, SbbSpinner, settings, containElement,
             colours, isMobile) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'browser/directives/illustration.html',
      scope: {
        ilu: '=',
        ontId: '@',
        prefixes: '=',
        setView: '&',
        getGxe: '&',
        setActiveUnit: '&',
        isZoomable: '&',
        getOntId: '&',
        expression: '=',
        isUnitOverlayed: '&',
        resetHeatMap: '&',
        view: '='
      },
      link: function(scope, element, attrs) {
        var $el = $(element),
            mousedown,
            x = 0,
            y = 0,
            oldX = 0,
            oldY = 0,
            mouseStartX,
            mouseStartY,
            mouseEndX,
            mouseEndY,
            transform = {
              translate: {
                x: 0,
                y: 0
              },
              rotate: 0,
              scale: 1
            },
            startPanX = 0,
            startPanY = 0,
            startScale = 1,
            smoothTransform = true,
            $container = $el,
            $containerWidth = $el.width(),
            $containerHeight = $el.height(),
            $containerOffset = $container.offset(),
            paper = new Raphael($el.attr('id'), $containerWidth, $containerHeight),
            $svg = $(paper.canvas),
            vectorElements = [],
            units = {},
            groups = {},
            fn = {},
            initialScale,
            defaultScale = 1,
            currentScale = 1,
            lastScale,
            stepZoom = 1,
            defaultCords = {'x': 0, 'y': 0},
            center = {'x': 0, 'y': 0},
            $zoomDialog = $('#zoomDialog'),
            $heatMapCloseDialog = $('#heatMapCloseDialog'),
            autoTransformed = false,
            groupOfGroups = [],
            colored_units = [],
            activeExpr,
            blockCloseClick,
            ticking = false,
            precedingTap = false,
            precedingTapTime = 0,
            tapScale = false,
            mc = new Hammer.Manager($el[0]);

        scope.heatmap = false;

        scope.closeHeatMap = function() {
          scope.expression = [];
        };

        scope.resetSingleGene = function() {
          news.broadcast('singleGene', undefined);
        };

        try {
          var isFileSaverSupported = !!new Blob();
          scope.fileSaverSupport = true;
        } catch (e) {
          scope.fileSaverSupport = false;
        }

        scope.download = function () {
          if (scope.fileSaverSupport) {
            try {
              var output = '<?xml version="1.0" encoding="utf-8"?>' +
                     '<!-- Downloaded from the Semantic Body Browser (http://sbb.cellfinder.org). For term of usage please refer to http://sbb.cellfinder.org/about#copyright -->' +
                     '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + jQuery("<p>").append($svg.clone()).html();
              var blob = new Blob([output], { type: "image/svg+xml;charset=utf-8" });
              saveAs(blob, scope.view.name.replace(/-/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) + " (SBB).svg");
            } catch (e) {}
          }
        };

        // Show illustration
        fn.show = function() {
          // Sets default values
          fn.setDefaults();
          fn.setSemantics();

          // Inialize paper
          paper.setViewBox(
            defaultCords.x,
            defaultCords.y,
            scope.ilu.viewBox.width,
            scope.ilu.viewBox.height, false
          );

          // Stop sbbSpinner
          spinner();

          // Clear the paper
          paper.clear();

          // Add title
          var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
          title.innerHTML = scope.view.name.replace(/-/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
          $svg.append(title);

          // Add copyright
          var copyright = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
          if (scope.view.holdCopyright) {
            copyright.innerHTML = copyright.innerHTML + 'Copyright (C) Semantic Body Browser. ';
          }
          copyright.innerHTML = copyright.innerHTML + 'Licensed under ' + scope.view.license;
          $svg.append(copyright);

          // Add meta information
          var created = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
          created.innerHTML = 'Created ' + new Date() + ' at http://sbb.cellfinder.org/' + scope.view.name + '.';
          $svg.append(created);

          // Create vector elements
          for(var i = 0; i < scope.ilu.elements.length; ++i) {
            // Calls the appropriate function for each element
            fn[scope.ilu.elements[i].type](i, scope.ilu.elements[i]);
          }

          // Create groups/sets
          fn.group();

          // Rerun grouping for groups of groups
          while (groupOfGroups.length) {
            fn.reGrouping(groupOfGroups);
          }

          fn.adjustStrokeWidth();

          // Applies the default values
          scope.displayAll(true);

          // Enable CSS rules
          scope.ready = true;

          // Set scope ready
          news.broadcast('iluReady');
        };

        // Sets the default value for scaling and cetering of the illustration
        fn.setDefaults = function() {
          // Set default zoom and coordinates
          var width = ($containerWidth / scope.ilu.viewBox.width),
            height = ($containerHeight / scope.ilu.viewBox.height);

          center.x = $containerWidth / 2;
          center.y = $containerHeight / 2;

          if(width < height) {
            initialScale = 1 / width;
            defaultCords.x = 0;
            defaultCords.y = -($containerHeight - (scope.ilu.viewBox.height * width)) / (2 * width);
          } else {
            initialScale = 1 / height;
            defaultCords.x = -($containerWidth - (scope.ilu.viewBox.width * height)) / (2 * height);
            defaultCords.y = 0;
          }
        };

        fn.setSemantics = function () {
          // Set default semantics
          // Register prefixes
          var prefix = '';
          for (var i = scope.prefixes.length; i--;) {
            prefix += scope.prefixes[i].abbr + ': ' + scope.prefixes[i].prefix + ' ';
          }
          paper.canvas.setAttribute('prefix', prefix.substring(0, prefix.length - 1));
          // Set context URI
          paper.canvas.setAttribute('about', scope.ontId.split('_')[0].toLowerCase() + ':' + scope.ontId);
        };

        fn.adjustStrokeWidth = function () {
          if (Math.abs(stepZoom - initialScale) > 0.1) {
            var i = vectorElements.length;
            while (i--) {
              if(typeof vectorElements[i].attrs['stroke-width'] !== 'undefined') {
                vectorElements[i].attr({
                  'stroke-width': vectorElements[i].attrs['stroke-width'] * (stepZoom / initialScale)
                });
              } else {
                // Remove stroke
                vectorElements[i].attr({
                  'stroke': undefined
                });
              }
            }
            stepZoom = initialScale;
          }
        };

        // Show error icon
        fn.error = function() {
          // Stop sbbSpinner
          spinner();

          // Clear the paper
          paper.clear();

          // Draw error icon from RaphaelJS Icons
          paper
            .path('M29.225,23.567l-3.778-6.542c-1.139-1.972-3.002-5.2-4.141-7.172l-3.778-6.542c-1.14-1.973-3.003-1.973-4.142,0L9.609,9.853c-1.139,1.972-3.003,5.201-4.142,7.172L1.69,23.567c-1.139,1.974-0.207,3.587,2.071,3.587h23.391C29.432,27.154,30.363,25.541,29.225,23.567zM16.536,24.58h-2.241v-2.151h2.241V24.58zM16.428,20.844h-2.023l-0.201-9.204h2.407L16.428,20.844z')
            .transform('t' + (($containerWidth / 2) - 15) + ',' + (($containerHeight / 2) - 15))
            .attr({
              'fill': '#cc503d',
              'stroke-width': 0
            });
        };

        //////////////////////////////////////////////////////////////
        // Watchers
        //////////////////////////////////////////////////////////////

        scope.$watch('ilu', function(value) {
          if (value) {
            if (value.error) {
              fn.error();
            } else {
              fn.show();
            }
          }
        });

        // Watch for genes
        scope.$watch('expression', function(newValue, oldValue) {
          if (newValue)  {
            fn.colorExpression();
          }
          if (newValue === null && oldValue) {
            fn.resetExpressioncolours();
          }
        });

        // Watch for changes of the local activeUnit variable and highlight /
        // reset the units appropriately
        scope.$watch('activeUnit', function(newValue, oldValue) {
          if(oldValue && oldValue !== newValue) {
            fn.reset(oldValue);
          }
          if(newValue) {
            if (scope.ready) {
              fn.highlight(newValue);
              fn.autoZoom(newValue);
            } else {
              scope.$on('iluReady', function () {
                fn.highlight(newValue);
                fn.autoZoom(newValue);
              });
            }
          }
        });

        // Listen for when a new active unit is broad-casted and change the
        // local variable appropriately
        scope.$on('activeUnit', function() {
          scope.activeUnit = news.activeUnit;
        });

        // Listens for the global click event broad-casted by the news service
        scope.$on('click', function() {
          if (scope.heatmap) {
            if (scope.heatMapCloseDialog && (blockCloseClick - Date.now() < 0)) {
              if (!containElement($heatMapCloseDialog[0], news.clickTarget)) {
                fn.showHeatMapCloseDialog();
              }
            }
          } else {
            if (!$el.find(news.clickTarget).length) {
              if (!$zoomDialog.find(news.clickTarget).length) {
                fn.showZoomDialog();
              }
            }
          }
        });

        scope.$on('singleGene', function(e, index, name) {
          if (typeof index !== 'undefined') {
            scope.selectedGene = name;
            fn.colorExpression(scope.selectedGene);
          } else {
            scope.selectedGene = undefined;
            fn.colorExpression();
          }
        });

        scope.$on('showAll', function(){
          scope.displayAll();
        });


        //////////////////////////////////////////////////////////////
        // Raphael functions
        //////////////////////////////////////////////////////////////

        // Method for rendering a rectangle
        fn.rect = function(i, attrs) {
          vectorElements[i] = paper.rect(attrs.x, attrs.y, attrs.width, attrs.height, attrs.r);
          fn.setAttrs(i, attrs);
        };

        // Method for rendering a circle
        fn.circle = function(i, attrs) {
          vectorElements[i] = paper.circle(attrs.x, attrs.y, attrs.r);
          fn.setAttrs(i, attrs);
        };

        // Method for rendering a ellipse
        fn.ellipse = function(i, attrs) {
          vectorElements[i] = paper.ellipse(attrs.x, attrs.y, attrs.rx, attrs.ry);
          fn.setAttrs(i, attrs);
        };

        // Method for rendering a path
        fn.path = function(i, attrs) {
          vectorElements[i] = paper.path(attrs.d);
          fn.setAttrs(i, attrs);
        };

        // Method for setting general attributes of elements
        fn.setAttrs = function(i, attrs) {
          vectorElements[i].attr(attrs);
          vectorElements[i].node.id = i;
          if (attrs.id) {
            units[attrs.id] = i;
            vectorElements[i].node.setAttribute('data-id', attrs.id);

            var ontId = scope.getOntId({'unit': attrs.id});
            if (ontId) {
              vectorElements[i].node.setAttribute('property', 'ro:has_part');
              vectorElements[i].node.setAttribute('resource', ontId.substring(0, ontId.indexOf('_')) + ':' + ontId);
            }
          }
        };

        // Method for setting groups
        fn.group = function(g) {
          var len = scope.ilu.groups.length,
            lastK;
          for (var i = 0; i < len; ++i) {
            var id = scope.ilu.groups[i].id;

            // Add group elements to units
            if (units[id]) {
              lastK = units[id].length;
              units[id] = units[id].concat(scope.ilu.groups[i].elements);
            } else {
              units[id] = scope.ilu.groups[i].elements;
            }
            // Add <g> element for semantic purpose
            if (groups[id]) {
              groups[id].push(paper.group());
            } else {
              groups[id] = [paper.group()];
            }
            var lastGroup = groups[id].length - 1;
            // RDFA
            if (id) {
              var ontId = scope.getOntId({'unit': id});
              if (ontId) {
                for (var j = groups[id].length - 1; j >= 0; j--) {
                  groups[id][j].node.setAttribute('property', 'ro:has_part');
                  groups[id][j].node.setAttribute('resource', ontId.substring(0, ontId.indexOf('_')) + ':' + ontId);
                }
              }
            }
            // Needed such that the DOM element is only moved once
            var move = true;
            for(var k = scope.ilu.groups[i].elements.length - 1; k >= lastGroup; --k) {
              if (typeof scope.ilu.groups[i].elements[k] === 'number') {
                // Move DOM element of the group once
                if (move) {
                  move = false;
                  vectorElements[scope.ilu.groups[i].elements[k]].node.parentNode.insertBefore(groups[id][lastGroup].node, vectorElements[scope.ilu.groups[i].elements[k]].node.nextSibling);
                }
                // Only add attribute when the element is no group
                // This case: annonymous path
                vectorElements[scope.ilu.groups[i].elements[k]].node.setAttribute('data-group', id);
                groups[id][lastGroup].push(vectorElements[scope.ilu.groups[i].elements[k]]);
              } else if (typeof units[scope.ilu.groups[i].elements[k]] === 'number') {
                // Move DOM element of the group once
                if (move) {
                  move = false;
                  vectorElements[units[scope.ilu.groups[i].elements[k]]].node.parentNode.insertBefore(groups[id][lastGroup].node, vectorElements[units[scope.ilu.groups[i].elements[k]]].node.nextSibling);
                }
                // This case: annotate path
                vectorElements[units[scope.ilu.groups[i].elements[k]]].node.setAttribute('data-group', id);
                groups[id][lastGroup].push(vectorElements[units[scope.ilu.groups[i].elements[k]]]);
              } else {
                // Some of the group may not have been created right now so
                // save these for a later checkup
                groupOfGroups.push({
                  parent: id,
                  id: lastGroup,
                  child: scope.ilu.groups[i].elements[k]
                });
              }
            }
          }
        };

        // Re-group groups of groups
        fn.reGrouping = function(groupOfGroups) {
          var group = groupOfGroups.pop();

          groups[group.child][0].node.setAttribute('data-group', group.parent);

          // Move
          try {
            $(groups[group.child][0].node).appendTo(groups[group.parent][group.id].node);
          } catch(e) {
            if (console) {
              console.log(e);
            }
          }
        };

        //////////////////////////////////////////////////////////////
        // Illustration manipulation
        //////////////////////////////////////////////////////////////

        // Applies the default values for the scaling and positioning of the
        // illustration
        scope.displayAll = function (notSmooth) {
          smoothTransform = true;
          fn.showZoomDialog();
          transform = {
            translate: {
              x: 0,
              y: 0
            },
            scale: 1,
            rotate: 0
          };

          fn.requestElementUpdate();
        };

        // linear interpolation between two values a and b
        // u controls amount of a/b and is in range [0.0,1.0]
        fn.lerp = function (a,b,u) {
          return (1-u) * a + u * b;
        };

        // Color expression
        fn.colorExpression = function ( gene ) {
          var color,
              tmpMax = 0,
              tmpMin = Number.MAX_VALUE,
              tmpNorm,
              oldColoredUnits = colored_units;

          // Set heatmap to true
          scope.heatmap = true;

          // Reset active unit and close dialog
          fn.showZoomDialog();
          scope.setActiveUnit({unit:undefined, group:undefined});

          fn.fadeOutElements();
          colored_units = [];

          // Color units
          if (gene) {
            for (var expId in scope.expression.sum) {
              if (scope.expression.sum.hasOwnProperty(expId) && units[expId]) {
                if (scope.expression[expId][gene] < tmpMin) {
                  tmpMin = scope.expression[expId][gene];
                }
                if (scope.expression[expId][gene] > tmpMax) {
                  tmpMax = scope.expression[expId][gene];
                }
              }
            }
            tmpNorm = (tmpMax - tmpMin);
          } else {
            gene = 'sum';
          }

          for (var expId2 in scope.expression.sum) {
            if (scope.expression.sum.hasOwnProperty(expId2) && units[expId2]) {
              if (scope.expression.norm === 0 || tmpNorm === 0) {
                fn.reset(expId2);
              } else {

                colored_units.push(expId2);

                var percent,
                    textColor;

                if (gene == 'sum') {
                  percent = (scope.expression.sum[expId2] - scope.expression.min) / scope.expression.norm;
                } else {
                  percent = (scope.expression[expId2][gene] - tmpMin) / tmpNorm;
                }

                /*
                 * Fade between 0% - 75% - 100%
                 * 0%   #004080
                 * 75%  #bf0000
                 * 100% #ffd500
                 */
                if (percent < 0.75) {
                  color = colours.overlay('#004080', '#bf0000', percent / 0.75);
                } else  {
                  color = colours.overlay('#bf0000', '#ffd500', (percent - 0.75) / 0.25 );
                }

                fn.highlight(expId2, color);
              }
            }
          }
          // Reset colored units that are not available in the new expression
          // data
          for (var i in oldColoredUnits) {
            if (!~colored_units.indexOf(oldColoredUnits[i])) {
              fn.reset(oldColoredUnits[i]);
            }
          }
        };

        // Reset expression colours
        fn.resetExpressioncolours = function () {
          scope.heatmap = false;
          fn.showHeatMapCloseDialog();

          // Reset highlighted units
          for (var i = colored_units.length; i >= 0; --i) {
            fn.reset(colored_units[i]);
          }

          // Reset opacity of all elements
          i = vectorElements.length;
          while (--i) {
            vectorElements[i].node.setAttribute('class', '');
          }
        };

        // Lower opacity of all elements
        fn.fadeOutElements = function () {
          var i = vectorElements.length;
          while (--i) {
            vectorElements[i].node.setAttribute('class', 'bg');
          }
        };

        // Lower opacity of all elements
        fn.fadeInElements = function () {
          var i = vectorElements.length;
          while (--i) {
            vectorElements[i].node.setAttribute('class', '');
          }
        };

        // Highlights interactive units as they are hovered by the mouse cursor
        fn.mouseover = function(e) {
          var id = e.target.id,
            unit = e.target.getAttribute("data-id"),
            group = e.target.getAttribute("data-group");

          if ((unit || group) && !scope.heatmap && fn.isNotActive( e.target )) {
            // #f2d291 is a yellow-ish color
            vectorElements[id].attr({
              fill: colours.overlay(scope.ilu.elements[id].fill, '#f2d291', 0.66),
              stroke: colours.overlay(scope.ilu.elements[id].stroke, '#f2d291', 0.5)
            });
          }
        };

        // Resets the original colours of the unit when the mouse cursor leaves
        fn.mouseout = function(e) {
          var id = e.target.id,
            unit = e.target.getAttribute("data-id"),
            group = e.target.getAttribute("data-group");

          if ((unit || group) && !scope.heatmap && fn.isNotActive( e.target )) {
            vectorElements[id].attr({
              fill: scope.ilu.elements[id].fill,
              stroke: scope.ilu.elements[id].stroke
            });
          }
        };

        /* Active only when:
         *  1. Unit is not the active unit AND
         *  2. Unit has no group OR
         *  3. Unit has a group which is not part of the active unit
         */
        fn.isNotActive = function( el ) {
          if (!scope.activeUnit) {
            return true;
          }

          var unit = el.getAttribute("data-id"),
            group = el.getAttribute("data-group"),
            parent = el.parentNode;

          if (unit == scope.activeUnit) {
            return false;
          }

          while (parent.tagName === 'g' && parent.getAttribute('data-group') && group != scope.activeUnit) {
            group = parent.getAttribute('data-group');
            parent = parent.parentNode;
          }

          if (group == scope.activeUnit) {
            return false;
          }

          return true;
        };

        // Sets a new active unit when a click on it is performed
        fn.click = function(target) {
          if(!scope.heatmap && (target.getAttribute("data-id") || target.getAttribute("data-group"))) {
            scope.setActiveUnit({unit: target.getAttribute("data-id"), group: target.getAttribute("data-group")});
            scope.$apply();
          }
        };

        // Open dialog if a double lick is performed on an interactive unit
        fn.dblclick = function(target, x, y) {
          if(!scope.heatmap && target && (target.getAttribute('data-id') || target.getAttribute('data-group'))) {
            fn.showZoomDialog(x, y);
          } else {
            if (scope.heatmap && !scope.activeUnit) {
              fn.showHeatMapCloseDialog(x, y);
            }
            fn.showZoomDialog();
            scope.setActiveUnit({unit:undefined, group:undefined});
            scope.$apply();
          }
        };

        // Opens a dialog which displays the unit's / group's definition and
        // gives the possibility to open CellFinder or to zoom in
        // No parameter == closing
        fn.showZoomDialog = function( x, y ) {
          if (x && y) {
            // Reset older unit Definition to avoid misunderstanding if loading
            // takes a second or two
            scope.unitDefinition = undefined;

            // Define drop down direction
            $zoomDialog.removeClass('left').removeClass('right').removeClass('top');
            if ( $containerWidth - x < 200) {
              $zoomDialog.addClass('left');
            }
            if ( x < 200) {
              $zoomDialog.addClass('right');
            }
            // We have to substract the header height from the y value
            if ( (y - 41) / $containerHeight > 0.5) {
              $zoomDialog.addClass('top');
            }

            // Check if active unit is zoomable
            scope.zoomDisabled = !scope.isZoomable({ unit: scope.activeUnit });
            scope.ontId = scope.getOntId({ unit: scope.activeUnit });
            if (scope.ontId) {
              $http
                .get( settings.apiPath + 'definitions/' + scope.ontId)
                .success(function (data) {
                  scope.unitDefinition = data[0];
                });
            }
            scope.$apply();

            // Set drop container coordinates
            $zoomDialog.css('top', (y - $containerOffset.top) + 'px' ).css('left', x + 'px' ).addClass('opened');
          } else {
            // Close dialog
            $zoomDialog.removeClass('opened');
          }
        };

        fn.showHeatMapCloseDialog = function( x, y ) {
          if (x && y) {
            // Define drop down direction
            $heatMapCloseDialog.removeClass('left').removeClass('right').removeClass('top');
            if ( $containerWidth - x < 130) {
              $heatMapCloseDialog.addClass('left');
            }
            if ( x < 130) {
              $heatMapCloseDialog.addClass('right');
            }
            // We have to substract the header height from the y value
            if ( (y - 41) / $containerHeight > 0.5) {
              $heatMapCloseDialog.addClass('top');
            }

            $heatMapCloseDialog.css('top', (y - $containerOffset.top) + 'px' ).css('left', x + 'px' );
            scope.heatMapCloseDialog = true;
            // Blocking the closing within the next 30 Milliseconds.
            blockCloseClick = Date.now() + 30;
          } else {
            if (scope.heatMapCloseDialog) {
              scope.heatMapCloseDialog = false;
              scope.$apply();
            }
          }
        };

        // Highlights a unit / set of units permanently
        fn.highlight = function(id, color, fade) {
          if (typeof color === 'undefined') {
            color = '#ff8a59'; // #ff8a59 = orange-ish color
          }

          if(!scope.ilu) {
            // If the illustration is not set yet than the highlight method
            // will wait till it is and call itself again
            scope.$watch('ilu', function(value){
              if(value) {
                fn.highlight(id, color, fade);
              }
            });
          } else {
            if(typeof units[id] !== 'undefined') {
              if (Object.prototype.toString.call( units[id] ) === '[object Array]') {
                if ((fade || (scope.activeUnit && scope.isUnitOverlayed({unit: scope.activeUnit}))) && !scope.heatmap) {
                  fn.fadeOutElements();
                }
                // a set of units is highlighted
                var i = units[id].length;
                while(i--) {
                  if (typeof units[id][i] === 'number') {
                    if (typeof scope.ilu.elements[units[id][i]].stroke === 'undefined' && scope.ilu.elements[units[id][i]].fill === 'none') {
                      // Unit currently has no color
                      if (scope.heatmap && color == '#ff8a59') {
                        vectorElements[units[id][i]].node.setAttribute('class', 'pulsate');
                      } else {
                        vectorElements[units[id][i]].node.setAttribute('class', '');
                        vectorElements[units[id][i]].attr({
                          fill: color,
                          stroke: color
                        });
                      }
                    } else {
                      // Unit has color
                      if (scope.heatmap && color == '#ff8a59') {
                        vectorElements[units[id][i]].node.setAttribute('class', 'pulsate');
                      } else {
                        vectorElements[units[id][i]].node.setAttribute('class', '');
                        vectorElements[units[id][i]].attr({
                          fill: colours.overlay(scope.ilu.elements[units[id][i]].fill, color, 0.85),
                          stroke: colours.overlay(scope.ilu.elements[units[id][i]].stroke, color, 0.75)
                        });
                      }
                    }
                  } else {
                    // Recursively calls itself if a subgroup, e.g. a group in
                    // a group, is found
                    fn.highlight(units[id][i], color);
                  }
                }
              }
              else if (typeof units[id] === 'number') {
                if ((fade || (scope.activeUnit && scope.isUnitOverlayed({unit: scope.activeUnit}))) && !scope.heatmap) {
                  fn.fadeOutElements();
                }
                // a single unit is highlighted
                if (typeof scope.ilu.elements[units[id]].stroke === 'undefined' && scope.ilu.elements[units[id]].fill === 'none') {
                  // Unit currently has no color
                  if (scope.heatmap && color == '#ff8a59') {
                    vectorElements[units[id]].node.setAttribute('class', 'pulsate');
                  } else {
                    vectorElements[units[id]].node.setAttribute('class', '');
                    vectorElements[units[id]].attr({
                      fill: color,
                      stroke: color
                    });
                  }
                } else {
                  // Unit has color
                  if (scope.heatmap && color == '#ff8a59') {
                    vectorElements[units[id]].node.setAttribute('class', 'pulsate');
                  } else {
                    vectorElements[units[id]].node.setAttribute('class', '');
                    vectorElements[units[id]].attr({
                      fill: colours.overlay(scope.ilu.elements[units[id]].fill, color, 0.85),
                      stroke: colours.overlay(scope.ilu.elements[units[id]].stroke, color, 0.75)
                    });
                  }
                }
              }
            } else {
              if (console) {
                console.log('Oh hell no! I can\'t find the ' + id);
              }
            }
          }
        };

        // Reset the original colours
        fn.reset = function(id) {
          if(!scope.ilu) {
            // If the illustration is not set yet than the highlight method
            // will wait till it is and call itself again
            scope.$watch('ilu', function(value){
              if(value) {
                fn.reset(id);
              }
            });
          } else {
            if(typeof units[id] !== 'undefined') {
              if (Object.prototype.toString.call( units[id] ) === '[object Array]') {
                if (!scope.heatmap) {
                  fn.fadeInElements();
                }
                var i = units[id].length;
                // a set of units is reset
                while(i--) {
                  if (typeof units[id][i] === 'number') {
                    if (scope.heatmap && ~colored_units.indexOf(id)) {
                      vectorElements[units[id][i]].node.setAttribute('class', '');
                    } else {
                      vectorElements[units[id][i]].attr({
                        fill: scope.ilu.elements[units[id][i]].fill,
                        stroke: scope.ilu.elements[units[id][i]].stroke
                      });
                    }
                  } else {
                    // Recursively calls itself if a subgroup, e.g. a group in
                    // a group, is found
                    fn.reset(units[id][i]);
                  }
                }
              }
              else if (typeof units[id] === 'number') {
                // a single unit is reset
                if (!scope.heatmap) {
                  fn.fadeInElements();
                  vectorElements[units[id]].attr({
                    fill: scope.ilu.elements[units[id]].fill,
                    stroke: scope.ilu.elements[units[id]].stroke
                  });
                } else {
                  if (~colored_units.indexOf(id)) {
                    vectorElements[units[id]].node.setAttribute('class', '');
                  } else {
                    vectorElements[units[id]].attr({
                      fill: scope.ilu.elements[units[id]].fill,
                      stroke: scope.ilu.elements[units[id]].stroke
                    });
                  }
                }
              }
            }
          }
        };

        // Resizes the drawing canvas
        fn.resizePaper = function() {
          var width = $el.width(),
            height = $el.height();

          if ((width && $containerWidth != width) || (height && $containerHeight != height)) {
            $containerWidth = width;
            $containerHeight = height;

            center.x = $containerWidth / 2;
            center.y = $containerHeight / 2;

            fn.setDefaults(); // Recalculate default positioning and scaling

            // Apply new default values
            paper.setSize($containerWidth, $containerHeight);
            paper.setViewBox(defaultCords.x, defaultCords.y, scope.ilu.viewBox.width, scope.ilu.viewBox.height, false);

            fn.adjustStrokeWidth();
          }
        };

        // d (delta): Number of times the mouse-wheel has been turned.
        // Vales < 0 means scrolling down the page == zoom in
        fn.mousewheel = function(e, d) {
          var mousewheelZoomFactor = 0.02;

          if (~navigator.userAgent.indexOf('Firefox') || ~navigator.userAgent.indexOf('MSIE')) {
            mousewheelZoomFactor *= 2;
          }

          fn.zoom(1 + (mousewheelZoomFactor * d));

          autoTransformed = false;
        };

        // Magnifies and shrinks the illustration
        fn.zoom = function(scaleFactor) {
          smoothTransform = true;
          if (scaleFactor) {
            var tmp = transform.scale * scaleFactor;

            // Zoomrange between 1/2 and 10 times
            if((tmp * 2 > defaultScale || scaleFactor > 1 ) && (tmp / 10 < defaultScale || scaleFactor < 1)) {
              transform.scale = tmp;
            } else {
              return false;
            }

          } else {
            transform.scale = defaultScale;
          }

          fn.requestElementUpdate();

          return true;
        };

        fn.autoZoom = function (id) {
          var el,
              dim,
              centerX,
              centerY,
              unitRelSize,
              unitAbsSize,
              scaleFactor,
              minX = Number.MAX_VALUE,
              minY = Number.MAX_VALUE,
              maxX = Number.MIN_VALUE,
              maxY = Number.MIN_VALUE,
              width,
              height;

          if (!autoTransformed) {
            // Store old coordinates and scale
            oldX = x;
            oldY = y;
            lastScale = currentScale;
          }

          if (Object.prototype.toString.call( units[id] ) === '[object Array]') {


            for (var i = groups[id].length - 1; i >= 0; i--) {
              dim = groups[id][i].node.getBBox();

              if (dim.x < minX) {
                minX = dim.x;
              }
              if (dim.y < minY) {
                minY = dim.y;
              }
              if (dim.x > maxX) {
                maxX = dim.x;
                width = dim.width;
              }
              if (dim.y > maxY) {
                maxY = dim.y;
                height = dim.height;
              }
            }
          } else if (typeof units[id] === 'number') {
            // Single unit
            el      = vectorElements[units[id]].node;
            dim     = el.getBBox();
            minX    = dim.x;
            minY    = dim.y;
            width   = dim.width;
            height  = dim.height;
          }


          centerX = (minX + width / 2 - defaultCords.x) / initialScale;

          centerY = (minY + height / 2 - defaultCords.y) / initialScale;

          unitRelSize = {
            width: width * currentScale / initialScale / $containerWidth,
            height: height * currentScale / initialScale / $containerHeight
          };

          unitAbsSize = {
            width: width / initialScale / $containerWidth,
            height: height / initialScale / $containerHeight
          };

          scaleFactor = 0.05 / Math.min(unitRelSize.width, unitRelSize.height);

          if (unitAbsSize.width < 0.04 && unitAbsSize.height < 0.1 || (unitAbsSize.height < 0.04 && unitAbsSize.width > 0.1)) {
            currentScale = Math.min(Math.max(0.5, currentScale * scaleFactor), 10);

            x = ($containerWidth / 2) - (centerX);
            y  = ($containerHeight / 2) - (centerY);

            autoTransformed = true;
          } else if (autoTransformed) {
            // Reset last coordinated and scale
            x = oldX;
            y = oldY;
            currentScale = lastScale;
            autoTransformed = false;
          } else {
            return;
          }

          transform.translate.x = x * currentScale;
          transform.translate.y = y * currentScale;
          transform.scale = currentScale;

          fn.requestElementUpdate();
        };

        fn.transform = function () {
          if (smoothTransform) {
            paper.canvas.setAttribute('class', 'smooth');
          } else {
            paper.canvas.setAttribute('class', '');
          }

          var value = [
            'translate(' + transform.translate.x + 'px, ' +
              transform.translate.y + 'px)',
            'scale(' + transform.scale + ', ' + transform.scale + ')',
            'rotate(' + transform.rotate + 'deg)'];

          value = value.join(" ");

          $svg.css('-webkit-transform', value);
          $svg.css('-moz-transform', value);
          $svg.css('-ms-transform', value);
          $svg.css('-o-transform', value);
          $svg.css('transform', value);

          ticking = false;
        };


        ///////////////////////////////////////////////////////////////////////
        // Event Handler
        ///////////////////////////////////////////////////////////////////////

        // Shim layer with setTimeout fallback
        // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
        // Creator Erik Möller
        (function() {
          var lastTime = 0;
          var vendors = ['webkit', 'moz'];
          for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
              window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
          }

          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
              var currTime = new Date().getTime();
              var timeToCall = Math.max(0, 16 - (currTime - lastTime));
              var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
              lastTime = currTime + timeToCall;
              return id;
            };
          }

          if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
              clearTimeout(id);
            };
          }
        }());

        fn.requestElementUpdate = function () {
          if(!ticking) {
            window.requestAnimationFrame(fn.transform);
            ticking = true;
          }
        };

        var hammerDoubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 }),
            hammerPan = new Hammer.Pan({ threshold: 0, pointers: 0 }),
            hammerTap = new Hammer.Tap();

        mc.add([
          hammerDoubleTap,
          hammerPan,
          hammerTap
        ]);

        mc.on("doubletap", function (ev) {
          fn.onDoubleTap(ev);
        });

        mc.on("pan", function (ev) {
          fn.onPan(ev);
        });

        mc.on("panstart", function (ev) {
          fn.onStartTap(ev);
        });

        mc.on("panend pancancel", function (ev) {
          fn.onEndPan(ev);
        });

        mc.on("tap", function (ev) {
          fn.onTap(ev);
        });

        /*
         * Mobile / Touch device only gestures
         *
         * Pinch: Zooming
         * Press: Pan-Zooming
         * Rotate: Rotating
         *
         * A double tap will be mapped to a predfined zoomed while a single tap
         * will show
         */
        if(isMobile.any) {
          var hammerPinch = new Hammer.Pinch({ threshold: 0 }),
              hammerPress = new Hammer.Press({ threshold: 5 }),
              hammerRotate = new Hammer.Rotate({ threshold: 0 });

          hammerPinch.recognizeWith([hammerPan, hammerRotate]);
          hammerRotate.recognizeWith(hammerPan);
          hammerTap.requireFailure(hammerDoubleTap);

          mc.add([
            hammerPinch,
            hammerPress,
            hammerRotate
          ]);

          mc.on("pinch", function (ev) {
            fn.onPinch(ev);
          });

          mc.on("press", function (ev) {
            fn.onPress(ev);
          });

          mc.on("rotate", function (ev) {
            fn.onRotate(ev);
          });
        }

        fn.onStartTap = function () {
          startPanX = transform.translate.x;
          startPanY = transform.translate.y;
          startScale = transform.scale;
        };

        fn.onEndPan = function () {
          tapScale = false;
          precedingTap = false;
        };

        fn.onPan = function (e) {
          if (isMobile.any && (tapScale || (precedingTap &&
              (new Date().getTime() - precedingTapTime < 500)))) {
            // Scale element
            smoothTransform = true;
            tapScale = true;
            transform.scale = (startScale + e.deltaY / $containerHeight);
          } else {
            // Drag element around
            smoothTransform = false;
            transform.translate = {
              x: startPanX + e.deltaX,
              y: startPanY + e.deltaY
            };
            fn.showZoomDialog();
            fn.showHeatMapCloseDialog();
          }
          precedingTap = false;
          fn.requestElementUpdate();
        };

        fn.onPinch = function (e) {
          smoothTransform = false;
          precedingTap = false;
          transform.scale = e.scale;
          fn.requestElementUpdate();
        };

        fn.onPress = function (e) {
          if (precedingTap && (new Date().getTime() - precedingTapTime < 1000)) {
            tapScale = true;
          }
        };

        fn.onRotate = function (e) {
          smoothTransform = false;
          precedingTap = false;
          transform.rotate = e.rotation;
          fn.requestElementUpdate();
        };

        fn.onTap = function (e) {
          precedingTap = true;
          precedingTapTime = new Date().getTime();
          fn.click(e.target);
          if ($zoomDialog.hasClass('opened') &&
              !$zoomDialog.find(e.target).length) {
            fn.showZoomDialog();
          }
          if (isMobile.any) {
            fn.dblclick(e.target, e.srcEvent.pageX, e.srcEvent.pageY);
          }
        };

        fn.onDoubleTap = function (e) {
          smoothTransform = true;
          precedingTap = false;
          if (isMobile.any) {
            // Toggle between a scale of 1, 2 and 4.
            transform.scale = Math.max((transform.scale * 2) % 8, 1);
            fn.showZoomDialog();
            fn.requestElementUpdate();
          } else {
            fn.dblclick(e.target, e.srcEvent.pageX, e.srcEvent.pageY);
          }
        };

        /*
         * END: Hammer.js 2.0.2
         */

        // Non-Hammer events
        $el
          .on('mouseover', function(e){
            fn.mouseover(e);
          })
          .on('mouseout', function(e){
            fn.mouseout(e);
          })
          .on('mousewheel', function(e, d, dX, dY) {
            fn.mousewheel(e, d);
          });

        $($window).on('resize', function() { fn.resizePaper(); });

        // Check if the activeUnit has already been set before the directory
        // loaded
        if (news.activeUnit)
        {
          scope.activeUnit = news.activeUnit;
        }

        // Start sbbSpinner
        var spinner = new SbbSpinner(paper, $containerWidth, $containerHeight);
      }
    };
  }
]);
