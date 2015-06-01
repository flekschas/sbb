describe('about.mobule Unit Testing', function () {
  'use strict';

  var module;

  beforeEach(function () {
    module = angular.module('sbb.about');
  });

  it('should be registered', function () {
    expect(module).not.toEqual(null);
  });
});
