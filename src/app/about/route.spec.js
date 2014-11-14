describe("about.route (unit testing)", function() {
  "use strict";

  var $rootScope,
      $location,
      $route,
      $httpBackend;

  beforeEach(function() {
    module('sbb');
    module('sbb.about');

    inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $location = $injector.get('$location');
      $route = $injector.get('$route');
      $httpBackend = $injector.get('$httpBackend');
    });

    $httpBackend.expectGET('http://sbb.cellfinder.org/api/1.2.3/changelog').respond(200, '');
    $httpBackend.expectGET('http://sbb.cellfinder.org/api/1.2.3/versions').respond(200, '');
  });

  it('should load the about template and controller',
    function () {
      $location.path('/about');
      $rootScope.$digest();

      expect($route.current.templateUrl).toEqual('about/template.html');
      expect($route.current.controller).toEqual('AboutCtrl');
    }
  );
});
