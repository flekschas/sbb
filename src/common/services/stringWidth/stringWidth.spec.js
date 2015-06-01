describe('stringWidth (unit testing)', function () {
  'use strict';

  var stringWidth;

  beforeEach(function () {
    // Define the $ as stringWidth needs it.
    module(function ($provide) {
      $provide.value('$', jQuery);
    });

    module('stringWidth');

    inject(function (_stringWidth_) {
      stringWidth = _stringWidth_;
    });
  });

  it('should contain the stringWidth service',
    function () {
      expect(stringWidth).not.toEqual(null);
    }
  );

  it('should always return a number if no text was given',
    function () {
      expect(typeof stringWidth()).toEqual('number');
    }
  );

  it('should return 0 if no text was given',
    function () {
      expect(stringWidth('')).toEqual(0);
    }
  );

  it('should return a value greater than 0 if no text was given',
    function () {
      expect(stringWidth('test') >= 0).toBeTruthy();
    }
  );

  it('should return different values for different words',
    function () {
      expect(stringWidth('test') !== stringWidth('tests')).toBeTruthy();
    }
  );

  it('should return different values for different font sizes',
    function () {
      expect(stringWidth('test', '12px arial') !== stringWidth('tests', '14px arial')).toBeTruthy();
    }
  );

});
