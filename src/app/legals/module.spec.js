describe('Legals Module: Unit Testing', function () {

  var module;

  beforeEach(function () {
    module = angular.module('sbb.legals');
  });

  it('should be registered', function () {
    expect(module).not.toEqual(null);
  });
});
