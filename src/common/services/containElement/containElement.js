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
        try {
          while (target.tagName.toLowerCase() !== 'body') {
            if (target.attributes.getNamedItem('SBBSEARCH')) {
              found = true;
              break;
            }
            // console.log(target, target.parentNode);
            target = target.parentNode;
          }

          // Remove special search attribute
          searchEl.removeAttribute('SBBSEARCH');
        }
        catch (e) {

        }

        return found;
      };
    }
  ]);
