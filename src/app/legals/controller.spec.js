describe("legals.controller (unit testing)", function() {
  "use strict";

  var AppCtrl,
      appScope,
      LegalsCtrl,
      legalsScope,
      $rootScope;

  beforeEach(function() {
    module('sbb');
    module('sbb.legals');

    inject(function ($injector) {
      var $controller = $injector.get('$controller');

      $rootScope = $injector.get('$rootScope');

      appScope = $rootScope.$new();

      AppCtrl = $controller('AppCtrl as app', {
        $scope: appScope
      });

      legalsScope = appScope.$new();

      LegalsCtrl = $controller('LegalsCtrl', {
        $scope: legalsScope
      });
    });
  });

  it('should have LegalsCtrl',
    function() {
      expect(LegalsCtrl).toBeTruthy();
    }
  );

  it('should set the app status to `ready`',
    function() {
      $rootScope.$digest();
      expect(legalsScope.app.status).toEqual('ready');
    }
  );
});
