describe("Unit: Filter: devStage", function() {
  "use strict";

  /*****************************************************************************
   * Global Variables
   ****************************************************************************/

  var $filter;


  /*****************************************************************************
   * Global Setting / Setup
   ****************************************************************************/

  beforeEach(function () {
    module( 'ngRoute' );
    module( 'sbb.browser' );

    inject(function (_$filter_) {
      $filter = _$filter_( 'devStage' );
    });
  });


  /*****************************************************************************
   * General / Existance Testing
   ****************************************************************************/

  it('should have a filter', function() {
    expect($filter).not.toEqual(null);
  });

  it('should return undefined when nothing is set', function() {
    expect($filter()).toEqual(undefined);
  });


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should return original varible when something other than a string is given',
    function() {
      expect($filter([1, 2, 3])).toEqual([1, 2, 3]);
    }
  );

  it('should return Carnegie Stage string when species is not mouse',
    function() {
      var string = 'cs-1',
          results;

      results = $filter(string, 'human');

      expect(results).toEqual('Carnegie stage 1');
    }
  );

  it('should return augmented string when species is mouse',
    function() {
      var prefix = 'cs-',
          results;

      function mapping (theiler) {
        if (theiler === 3) {
          return 4;
        }
        if (theiler === 4) {
          return 6;
        }
        if (theiler > 3 && theiler <= 18) {
          return theiler + 3;
        }
        if (theiler > 18) {
          return Math.min(22, theiler + 2);
        }
        return theiler;
      }

      for (var i = 1; i < 21; i++) {
        expect($filter(prefix + i, 'mouse'))
          .toEqual('Carnegie stage '+ i +' (Theiler stage '+ mapping(i) +')');
      }

      /*
       * Carnegie stages over 20 should fall back to `adult`
       */
      expect($filter(prefix + '25', 'mouse'))
        .toEqual('Adult');

      expect($filter('whatever', 'mouse'))
        .toEqual('Adult');
    }
  );

  it('should allow sub-stages',
    function() {
      var string = 'cs-17a',
          results;

      results = $filter(string, 'mouse');

      expect(results).toEqual('Carnegie stage 17a (Theiler stage 20a)');
    }
  );
});
