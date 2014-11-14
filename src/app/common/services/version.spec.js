describe("app.service.version (unit testing)", function() {
  "use strict";

  var versionService,
      $rootScope,
      $httpBackend,
      changelogFakeData = [
          {
            version: "0.0.0",
            type: "fix",
            msg: "test"
          }
        ],
      versionsFakeData = [
          {
            version: "0.0.0",
            release: "2000-01-01",
            msg: "test"
          }
        ];

  beforeEach(function() {
    module('sbb');

    inject(function ($injector) {
      versionService = $injector.get('versionService');

      $rootScope = $injector.get('$rootScope');
      $httpBackend = $injector.get('$httpBackend');

      $httpBackend
        .expectGET('http://sbb.cellfinder.org/api/1.2.3/changelog')
        .respond(changelogFakeData);

      $httpBackend
        .expectGET('http://sbb.cellfinder.org/api/1.2.3/versions')
        .respond(versionsFakeData);
    });
  });

  it('should contain the versionService',
    function () {
      expect(versionService).not.toEqual(null);
    }
  );

  it('exists the `getChangelog` function',
    function () {
      expect(typeof(versionService.getChangelog)).toEqual('function');
    }
  );

  it('exists the `getVersions` function',
    function () {
      expect(typeof(versionService.getVersions)).toEqual('function');
    }
  );

  it('should resolve a promise',
    function () {
      var changelog,
          versions,
          transformedChangelog = {
            "0.0.0": changelogFakeData
          };

      versionService.getChangelog().then(function(data){
        changelog = data;
      });

      versionService.getVersions().then(function(data){
        versions = data;
      });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(changelog).toEqual(transformedChangelog);
      expect(versions).toEqual(versionsFakeData);
    }
  );

});
