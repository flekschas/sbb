describe('legals.route (unit testing)', function () {
  'use strict';

  var $rootScope,
      $location,
      $route;

  beforeEach(function () {
    module('sbb');
    module('sbb.legals');

    inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $location = $injector.get('$location');
      $route = $injector.get('$route');
    });
  });

  it(
    'should load the legals template and controller',
    function () {
      $location.path('/legals');
      $rootScope.$digest();

      expect($route.current.templateUrl).toEqual('legals/template.html');
      expect($route.current.controller).toEqual('LegalsCtrl');
    }
  );
});
