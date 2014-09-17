angular
  .module( 'containElement', [] )
  .factory( 'containElement', [
    function () {
      return function (searchEl, targetEl) {
        var found = false;

        // Set special attribute to identify element while browsing up the
        // dom tree.
        searchEl.setAttribute('SBBSEARCH', true);

        var target = targetEl;
        while (target.tagName.toLowerCase() != 'body') {
          if (target.attributes.getNamedItem('SBBSEARCH')) {
            found = true;
            break;
          }
          target = target.parentNode;
        }

        // Remove special search attribute
        searchEl.removeAttribute('SBBSEARCH');

        return found;
      };
    }
  ]);
