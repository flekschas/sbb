describe('browser.route (unit testing)', function () {
  'use strict';

  var $rootScope,
      $location,
      $route,
      $httpBackend,
      settings;

  beforeEach(function () {
    module('sbb');
    module('sbb.browser');

    inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $location = $injector.get('$location');
      $route = $injector.get('$route');
      $httpBackend = $injector.get('$httpBackend');
      settings = $injector.get('settings');
    });

    $httpBackend
      .expectGET(settings.apiPath + 'browser')
      .respond(200, '');
  });

  it('should load the browser template and controller',
    function () {
      $location.path('/browser');
      $rootScope.$digest();

      expect($route.current.templateUrl).toEqual('browser/template.html');
      expect($route.current.controller).toEqual('BrowserCtrl');
    }
  );
});
