describe("Home Module: Unit Testing", function() {

  var module;
  beforeEach(function() {
    module = angular.module("sbb.home");
  });

  it("should be registered", function() {
    expect(module).not.toEqual(null);
  });
});
