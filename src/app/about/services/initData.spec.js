describe('about.service.initData (unit testing)', function () {
  'use strict';

  var $rootScope,
      aboutInitData,
      settings;

  beforeEach(function () {
    module('sbb');
    module('sbb.about');

    inject(function ($injector) {
      var versionService = $injector.get('versionService'),
          $q = $injector.get('$q'),
          $httpBackend = $injector.get('$httpBackend');

      $rootScope = $injector.get('$rootScope');
      aboutInitData = $injector.get('aboutInitData');
      settings = $injector.get('settings');

      spyOn(versionService, 'getChangelog')
        .and.callFake(function () {
          var deferred = $q.defer();
          deferred.resolve('test');
          return deferred.promise;
        });

      spyOn(versionService, 'getVersions')
        .and.callFake(function () {
          var deferred = $q.defer();
          deferred.resolve('test');
          return deferred.promise;
        });

      $httpBackend
        .expectGET(settings.apiPath + 'changelog')
        .respond(200, '');

      $httpBackend
        .expectGET(settings.apiPath + 'versions')
        .respond(200, '');
    });
  });

  it('should contain the aboutInitData service',
    function () {
      expect(aboutInitData).not.toEqual(null);
    }
  );

  it('should resolve a promise',
    function () {
      var data = {
            changelog: 'test',
            versions: 'test'
          },
          results;

      aboutInitData().then(function (data) {
        results = data;
      });

      $rootScope.$digest();

      expect(results).toEqual(data);
    }
  );
});
