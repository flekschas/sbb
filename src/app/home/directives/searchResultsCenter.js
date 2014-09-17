angular
  .module( 'sbb.home' )
  .directive( 'searchResultsCenter', ['$',
    function ( $ ) {
      return function(scope, element) {
        var $el = $(element);
        // Center search results vertically
        $el.css('top', '-' + ($el.prev().outerHeight() / 2) + 'px');
      };
    }
  ]);
