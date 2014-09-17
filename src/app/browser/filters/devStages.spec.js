describe("Unit: Filter: devStage", function() {
  "use strict";

  var $filter;

  beforeEach(function () {
    module( 'ngRoute' );
    module( 'sbb.browser' );

    inject(function (_$filter_) {
      $filter = _$filter_( 'devStage' );
    });
  });

  it('should have a filter', function() {
    expect($filter).not.toEqual(null);
  });

  it('should return null when nothing is set', function() {
    expect($filter()).toEqual(null);
  });

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
      var string = 'cs-17',
          results;

      results = $filter(string, 'mouse');

      expect(results).toEqual('Carnegie stage 17 (Theiler stage 20)');
    }
  );

  it('should allow substages',
    function() {
      var string = 'cs-17a',
          results;

      results = $filter(string, 'mouse');

      expect(results).toEqual('Carnegie stage 17a (Theiler stage 20a)');
    }
  );
});
