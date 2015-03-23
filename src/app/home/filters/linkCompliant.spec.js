describe("Unit: Filter: linkCompliant", function() {
  "use strict";

  var $filter;

  beforeEach(function () {
    module( 'ngRoute' );
    module( 'sbb.home' );

    inject(function (_$filter_) {
      $filter = _$filter_( 'linkCompliant' );
    });
  });

  it('should have a filter', function() {
    expect($filter).not.toEqual(null);
  });

  it('should return undefined when nothing is set', function() {
    expect($filter()).toEqual(undefined);
  });

  it('should return a string with the same length as the original',
    function() {
      var string = 'test string',
          results;

      results = $filter(string);

      expect(results.length).toEqual(string.length);
  });

  it('should return a string without withspaces',
    function() {
      var string = 'a b c d e',
          results;

      results = $filter(string);

      expect(results.indexOf(' ')).toEqual(-1);
  });
});
