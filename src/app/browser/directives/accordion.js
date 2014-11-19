angular
  .module( 'sbb.browser' )
  .directive( 'sbbAccordion', ['$', 'news',
    function($, news) {
      var directive = {
        link: link,
        restrict: 'AE'
      };

      function link ( scope, element, attrs ) {
        /*
         * *********************************************************************
         * Variables
         * *********************************************************************
         */

        var $el = $(element),
            panels = {},
            numPanels = 0,
            numOpenPanels = 0,
            accordionHeight = $el.height(),
            contentHeight = 0,
            togglerHeight = 20,
            lastClick = 0;

        /*
         * *********************************************************************
         * Private
         * *********************************************************************
         */

        function init () {
          /*
           * Store each panel's DOM reference in an object for fast access
           */
          $el.find('[panel]').each(function( index ) {
            var $this = $(this);

            /*
             * Get height of toggler
             */
            if (index === 1) {
              togglerHeight = $this.find('.toggler').outerHeight();
            }

            panels[$this.attr('panel')] = {
              open: $this.hasClass('open'),
              el: $this,
              content: $this.find('.content')
            };

            numPanels++;

            if ($this.hasClass('open')) {
              numOpenPanels++;
            }
          });

          news.broadcast('sbbAccordion:ready');

          contentHeight = accordionHeight - numPanels * togglerHeight;

          setPanelHeight();
        }

        function setPanelHeight () {
          for (var id in panels) {
            if (panels.hasOwnProperty(id)) {
              if (panels[id].open) {
                panels[id].content.css('height', contentHeight / numOpenPanels);
                news.broadcast('panel', {
                  name: id,
                  height: contentHeight / numOpenPanels
                });
              } else {
                panels[id].content.css('height', 0);
                news.broadcast('panel', {
                  name: id,
                  height: 0
                });
              }
            }
          }
        }
        function maximise ( panel ) {
          /*
           * Maximise one panel and minimise all other panels.
           */
          lastClick = 0;

          for (var id in panels) {
            if (panels.hasOwnProperty(id)) {
              if (id === panel) {
                panels[id].open = true;
                panels[id].el.addClass('open');
              } else {
                panels[id].open = false;
                panels[id].el.removeClass('open');
              }
            }
          }

          numOpenPanels = 1;

          setPanelHeight();
        }

        function toggle ( panel ) {
          try {
            /*
              * Toggle between visibility.
              */
            lastClick = Date.now();
            if (panels[panel].open) {
              /*
                * Close panel
                */
              numOpenPanels--;
              panels[panel].open = false;
              panels[panel].el.removeClass('open');
            } else {
              /*
                * Open panel
                */
              numOpenPanels++;
              panels[panel].open = true;
              panels[panel].el.addClass('open');
            }
            setPanelHeight();
          } catch (e) {
            console.log(e);
          }
        }

        function open ( panel ) {
          try {
            if (!panels[panel].open) {
              toggle(panel);
            }
          } catch (e) {
            console.log(e);
          }
        }

        /*
         * *********************************************************************
         * Public
         * *********************************************************************
         */

        scope.maximise = function ( panel ) {
          maximise(panel);
        };

        scope.toggle = function ( panel ) {
          toggle(panel);
        };

        /*
         * *********************************************************************
         * Listeners
         * *********************************************************************
         */

        scope.$on('sbbAccordion:open', function (e, panel) {
          open(panel);
        });

        /*
         * *********************************************************************
         * Initialise
         * *********************************************************************
         */

        init();
      }

      return directive;
    }
  ]);
