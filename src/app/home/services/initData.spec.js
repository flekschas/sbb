describe("home.service.initData (unit testing)", function() {
  "use strict";

  var homeInitData,
      $rootScope;

  beforeEach(function() {
    module('sbb');
    module('sbb.home');

    inject(function ($injector) {
      var versionService = $injector.get('versionService'),
          $q = $injector.get('$q'),
          $httpBackend = $injector.get('$httpBackend');

      homeInitData = $injector.get('homeInitData');
      $rootScope = $injector.get('$rootScope');

      spyOn(versionService, "getVersions")
        .andCallFake(function() {
          var deferred = $q.defer();
          deferred.resolve('test');
          return deferred.promise;
        });

      $httpBackend
        .expectGET('http://sbb.cellfinder.org/api/1.2.3/versions')
        .respond(200, '');
    });
  });

  it('should contain the homeInitData service',
    function () {
      expect(homeInitData).not.toEqual(null);
    }
  );

  it('should resolve a promise',
    function () {
      var data = {
            versions: 'test'
          },
          results;

      homeInitData().then(function(data){
        results = data;
      });

      $rootScope.$digest();

      expect(results).toEqual(data);
    }
  );

});
