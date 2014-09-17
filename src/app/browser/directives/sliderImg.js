angular
  .module( 'sbb.browser' )
  .directive( 'sbbSliderImg', ['$timeout', '$', 'news',
  function($timeout, $, news) {
    return {
      restrict: 'E',
      scope: {
        picture: '@',
        ready: '='
      },
      templateUrl: 'browser/directives/sliderImg.html',
      replace: true,
      link: function(scope, element) {
        var sliderWidthOn,
            $el = $(element),
            fn = {
              checkImageSrc: function () {
                $el.on('load', function () {
                  scope.active = true;
                  fn.checkHeight();
                  news.broadcast('sliderImageOkay');
                  return true;
                });
                $el.on('error', function () {
                  scope.active = false;
                  return false;
                });
              },
              unSetSrcWatcher: function () {
                srcWatcher();
                setSrc();
              },
              setSrc: function () {
                /*
                 * Unset $watch and $on to save resources.
                 */
                readyWatcher();
                fn.checkImageSrc();
                // scope.src = 'http://cellfinder.org/omero/webgateway/render_thumbnail/' + scope.picture + '/' + news.sliderWidth + '/';
                $el.css("background-image", "url('http://cellfinder.org/omero/webgateway/render_thumbnail/" + scope.picture + "/" + $el.width() + "/')");
              },
              checkHeight: function () {
                var i = 0;
                console.log($el.css('height'))
                (function checkHeight(height) {
                  $timeout(function(){
                    if (height === 0 && i < 25) {
                      ++i;
                      checkHeight($el.height());
                    } else if (height > 0 && i < 25) {
                      news.broadcast('sliderHeight', height);
                    }
                  }, 100);
                })($el.height());
              },
              checkPicture: function () {
                if (scope.picture && scope.picture.length) {
                  fn.setSrc();
                } else {
                  var srcWatcher = scope.$watch('picture', function(value) {
                    if (value && value.length) {
                      fn.unSetSrcWatcher();
                    }
                  });
                }
              }
            };

        var readyWatcher = scope.$watch('ready', function(){
          if (scope.ready) {
            fn.checkPicture();
          }
        });
      }
    };
  }
]);
