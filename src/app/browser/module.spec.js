describe('Browser Module: Unit Testing', function () {
  'use strict';

  var module;
  beforeEach(function () {
    module = angular.module('sbb.browser');
  });

  it('should be registered', function () {
    expect(module).not.toEqual(null);
  });

  describe('Dependencies:', function () {

    var deps,
        hasModule = function (m) {
          return deps.indexOf(m) >= 0;
        };

    beforeEach(function () {
      deps = module.value('sbb.browser').requires;
    });

    /*
     * Test module dependencies
     */
    it('should have colours as a dependency', function () {
      expect(hasModule('colours')).toEqual(true);
    });

    it('should have containElement as a dependency', function () {
      expect(hasModule('containElement')).toEqual(true);
    });

    it('should have maxStringLength as a dependency', function () {
      expect(hasModule('maxStringLength')).toEqual(true);
    });

    it('should have pmid as a dependency', function () {
      expect(hasModule('pmid')).toEqual(true);
    });

    it('should have SbbSpinner as a dependency', function () {
      expect(hasModule('SbbSpinner')).toEqual(true);
    });

    it('should have stringWidth as a dependency', function () {
      expect(hasModule('stringWidth')).toEqual(true);
    });
  });
});
