describe("Directive: Unit: SBB Accordion", function() {

  var $compile, $rootScope;

  beforeEach(function () {
    module( 'sbb.browser' );

    inject(['$compile','$rootScope', function ($c, $r) {
        $compile = $c;
        $rootScope = $r;
    }]);
  });

});
