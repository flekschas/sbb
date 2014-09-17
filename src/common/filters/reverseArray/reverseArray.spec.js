describe("Unit: reverseArray", function() {
  "use strict";

  var $filter;

  beforeEach(function () {
    module('reverseArray');

    inject(function (_$filter_) {
      $filter = _$filter_('reverseArray');
    });
  });

  it('should have a filter', function() {
    expect($filter).not.toEqual(null);
  });

  it('should return null when nothing is set', function() {
    expect($filter()).toEqual(null);
  });

  it('should return a reversed array',
     function() {
      expect($filter([1,2,3])).toEqual([3,2,1]);
  });
});
