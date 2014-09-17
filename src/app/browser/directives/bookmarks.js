angular
  .module( 'sbb.browser' )
  .directive( 'sbbBookmarks', ['$location', '$', 'news', 'storage', 'settings',
  function ($location, $, news, storage, settings) {
    return {
      restrict: 'A',
      templateUrl: 'browser/directives/bookmarks.html',
      scope: {
        setLocation: '&',
        name: '@',
        displayOnly: '@'
      },
      link: function(scope, element) {
        var $el = $(element),
            opened,
            bookmarks;

        scope.buttonText = 'Add Bookmark';

        scope.addBookmark = function() {
          if(!scope.disabled && scope.name) {
            var url = $location.url();

            bookmarks = storage.get('bookmarks');
            console.log(bookmarks);
            if (bookmarks.length > 0) {
              bookmarks.unshift({'name': scope.name,'url': url});
            } else {
              bookmarks = [{'name': scope.name,'url': url}];
            }
            bookmarks = bookmarks.splice(0, settings.maxBookmarks);


            storage.set('bookmarks', bookmarks);
            scope.bookmarks = bookmarks;

            scope.disabled = true;
            scope.buttonText = 'Bookmark added';
          }
        };

        // Toggles the visibility of the drop down menu
        scope.toggle = function(state) {
          if (scope.enabled) {
            opened = (typeof state === 'undefined') ? !opened : state;
            $el.removeClass(opened ? 'closed' : 'opened');
            $el.addClass(opened ? 'opened' : 'closed');
          }
        };

        // Listens for the global click event broad-casted by the news service
        scope.$on('click', function() {
          if ($el.find(news.clickTarget.tagName)[0] !== news.clickTarget) {
            scope.toggle(false);
          }
        });

        // Watchers
        scope.$watch(function() {
          return $location.url();
        }, function(newValue){
          if(newValue && scope.bookmarks) {
          // '~' bit-wise negation => each 1 turns to 0 because
          // indexOf returns '-1', when nothing is found, which is
          // represented by 1111..111 it will be turned into 0 which
          // is falsy
            for (var i = scope.bookmarks.length - 1; i >= 0; i--) {
              if (scope.bookmarks[i].url == newValue) {
                scope.disabled = true;
                scope.buttonText = 'Bookmark added';
              }
            }
          } else {
            scope.disabled = false;
          }
        });

        scope.$watchCollection('[bookmarks, displayOnly]', function (value) {
          if ((value[0] && value[0].length) || !value[1]) {
            scope.enabled = true;
          } else {
            scope.enabled = false;
          }
        });

        // Init
        // scope.toggle();
        scope.bookmarks = storage.get('bookmarks');
      }
    };
  }
]);
