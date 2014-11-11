describe("maxStringLength (unit testing)", function() {
  "use strict";

  var $filter;

  beforeEach(function () {
    module('maxStringLength');

    inject(function (_$filter_) {
      $filter = _$filter_('maxStringLength');
    });
  });

  it('should have a filter', function() {
    expect($filter).not.toEqual(null);
  });

  it('should return null when nothing is set', function() {
    expect($filter()).toEqual(null);
  });

  it('should return full string when length is below standard cutoff',
     function() {
      expect($filter('short string')).toEqual('short string');
    }
  );

  it('should return full string when length is below custom cutoff',
     function() {
      var string = 'short string',
          result;

      result = $filter(string, 200);

      expect(result).toEqual(string);
  });

  it('should cutted string after a word once reached the standard cutoff when length is above standard cutoff',
     function() {

      var longString = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo edolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.';

      var shortString = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua....';

      expect($filter(longString)).toEqual(shortString);
  });

  it('should not cut directly at the standard cutoff',
     function() {

      var longString = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo edolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.';

      var shortString = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam volu...';

      expect($filter(longString)).not.toEqual(shortString);
  });

  it('should cutted string after the last word after reaching a custom cutoff when length is above that custom cutoff',
     function() {
      var longString = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo edolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
          shortString = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy...',
          result;

      result = $filter(longString, 70);

      expect(result).toEqual(shortString);
  });
});
