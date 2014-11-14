describe("browser.route (unit testing)", function() {
  "use strict";

  var $rootScope,
      $location,
      $route,
      $httpBackend;

  beforeEach(function() {
    module('sbb');
    module('sbb.browser');

    inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $location = $injector.get('$location');
      $route = $injector.get('$route');
      $httpBackend = $injector.get('$httpBackend');
    });

    $httpBackend.expectGET('http://sbb.cellfinder.org/api/1.2.3/browser').respond(200, '');
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
