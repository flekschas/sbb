angular
  .module( 'maxStringLength', [])
  .filter( 'maxStringLength', [
    function() {
      /*
       Cuts a given text after the a certain number of characters.
       (last word is preserved)
       */
      return function(s, limit) {
        limit = limit ? limit : 150;
        if (s && s.length > limit) {
          s = s.substr(0, limit + s.substr(limit).indexOf(' ')) + '...';
        }
        return s;
      };
    }
  ]);
