describe("Home Module: Unit Testing", function() {

  var module;
  beforeEach(function() {
    module = angular.module("sbb.home");
  });

  it("should be registered", function() {
    expect(module).not.toEqual(null);
  });

  describe("Dependencies:", function() {

    var deps,
        hasModule = function(m) {
          return deps.indexOf(m) >= 0;
        };

    beforeEach(function() {
      deps = module.value('sbb.home').requires;
    });

    /*
     * Test module dependencies
     */
  });
});
