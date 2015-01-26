angular
  .module( 'sbb.browser' )
  .directive( 'sbbResultsBar', [
    '$compile', '$templateCache', '$', 'Spinner', 'news', 'bioSamples',
    function($compile, $templateCache, $, Spinner, news, bioSamples) {
      var directive = {
        link: link,
        restrict: 'AE',
        replace: true,
        scope: {
          show: '=',
          results: '=',
          type: '@',
          loading: '=',
        },
        templateUrl: 'browser/directives/resultsBar.html'
      };

      function link ( scope, element, attrs ) {
        var $content = $(element[0].querySelector('.content')),
            $limited,
            $scrollListener,
            spinnerOpts = {
              lines: 11,
              length: 10,
              width: 2,
              color: '#000',
              speed: 2,
              trail: 50,
              hwaccel: true
            },
            spinner = new Spinner(spinnerOpts);

        scope.limit = 25;
        scope.error = false;
        scope.nothingFound = false;


        /* *********************************************************************
         * Watchers and Listerners
         * ********************************************************************/

        scope.$watch('type', function (tplName) {
          if (tplName.length > 0) {
            var tpl = $templateCache
                        .get('browser/partials/resultsBar/' + tplName + '.html');

            if (tpl) {
              $content.html($compile(tpl)(scope));
            }

            $limited = element[0].querySelector('.limited');

            if ($limited.length) {
              setScrollListener();
            } else {
              unsetScrollListener();
            }
          }
        });

        scope.$watch('loading', function () {
          if (scope.loading) {
            scope.nothingFound = false;
            spinner.spin(element[0].querySelector('.loading'));
          } else {
            spinner.stop();
            checkStatus();
          }
        });


        /* *********************************************************************
         * Listerners
         * ********************************************************************/

         scope.$on('error:getGXE', function(e, errNo) {
          scope.error = true;
          scope.nothingFound = false;
          scope.loading = false;
         });


        /* *********************************************************************
         * Public functions
         * ********************************************************************/

        scope.openGXE = function ( data ) {
          news.broadcast('sbbDialog:open', {
            scope: data,
            size: 'large',
            tpl: 'browser/partials/dialogs/gxe.html'
          });

          bioSamples
            .getExpDetails(data.exp)
            .then(function ( results ) {
              news.broadcast('sbbDialog:updateContent', results);
            });
        };


        /* *********************************************************************
         * Private functions
         * ********************************************************************/

        function setScrollListener () {
          $scrollListener = $content.on('scroll', function (e) {
            // Check if we scrolled to the bottom
            if ((e.currentTarget.scrollTop + 5) >= (e.currentTarget.scrollHeight - e.currentTarget.offsetHeight)) {
              if (scope.results.length > scope.limit) {
                scope.limit += 25;
              }
              scope.$apply();
            }
          });
        }

        function unsetScrollListener () {
          $content.off('scroll');
        }

        function checkStatus () {
          if (scope.results === null) {
            scope.nothingFound = true;
          } else {
            scope.nothingFound = false;
          }
        }
      }

      return directive;
    }
  ]);
