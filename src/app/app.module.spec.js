describe('App Module: Unit Testing', function () {
  'use strict';

  var module;

  beforeEach(function () {
    module = angular.module('sbb');
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
      deps = module.value('sbb').requires;
    });

    /*
     * HTML in JS templates for All-In-One loading
     */
    it('should have templates-app as a dependency', function () {
      expect(hasModule('templates-app')).toEqual(true);
    });

    it('should have templates-common as a dependency', function () {
      expect(hasModule('templates-common')).toEqual(true);
    });

    /*
     * Angular modules
     */
    it('should have ngRoute as a dependency', function () {
      expect(hasModule('ngRoute')).toEqual(true);
    });

    /*
     * Semantic Body Browser modules
     */
    it('should have sbb.home as a dependency', function () {
      expect(hasModule('sbb.home')).toEqual(true);
    });

    it('should have sbb.about as a dependency', function () {
      expect(hasModule('sbb.about')).toEqual(true);
    });

    it('should have sbb.legals as a dependency', function () {
      expect(hasModule('sbb.legals')).toEqual(true);
    });

    it('should have sbb.browser as a dependency', function () {
      expect(hasModule('sbb.browser')).toEqual(true);
    });

    it('should have errors as a dependency', function () {
      expect(hasModule('errors')).toEqual(true);
    });
  });
});
