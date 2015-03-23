describe("home.service.initData (unit testing)", function() {
  "use strict";

  var $rootScope,
      $httpBackend,
      $q,
      homeInitData,
      versionService;

  beforeEach(function() {
    module('sbb');
    module('sbb.home');

    inject(function ($injector) {
      $q = $injector.get('$q');
      $httpBackend = $injector.get('$httpBackend');
      versionService = $injector.get('versionService');
      homeInitData = $injector.get('homeInitData');
      $rootScope = $injector.get('$rootScope');
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

      spyOn(versionService, "getVersions")
        .and.callFake(function() {
          var deferred = $q.defer();
          deferred.resolve('test');
          return deferred.promise;
        });

      $httpBackend
        .expectGET('http://sbb.cellfinder.org/api/1.2.3/versions')
        .respond(200, '');

      homeInitData().then(function(data){
        results = data;
      });

      $rootScope.$digest();

      expect(results).toEqual(data);
    }
  );

  it('should return `null` if promise is rejected',
    function () {
      var data = {
            versions: null
          },
          results;

      spyOn(versionService, "getVersions")
        .and.callFake(function() {
          var deferred = $q.defer();
          deferred.reject('test');
          return deferred.promise;
        });

      $httpBackend
        .expectGET('http://sbb.cellfinder.org/api/1.2.3/versions')
        .respond(200, '');

      homeInitData()
        .then(function(data){
          results = data;
        });

      $rootScope.$digest();

      expect(results).toEqual(data);
    }
  );

});
