describe("browser.service.initData (unit testing)", function() {
  "use strict";

  /*****************************************************************************
   * Global Variables
   ****************************************************************************/

  var $rootScope,
      $httpBackend,
      $q,
      $fakeLocation = {
        path: function () {
          return '/test';
        }
      },
      browserInitData,
      viewData;


  /*****************************************************************************
   * Global Setting / Setup
   ****************************************************************************/

  beforeEach(function() {
    module('sbb');
    module('sbb.browser');

    module( function ($provide) {
      // We register the fakeLocation service
      $provide.constant( '$location' , $fakeLocation );
    });

    inject(function ($injector) {
      $q = $injector.get('$q');
      $httpBackend = $injector.get('$httpBackend');
      viewData = $injector.get('viewData');
      browserInitData = $injector.get('browserInitData');
      $rootScope = $injector.get('$rootScope');
    });
  });


  /*****************************************************************************
   * General / Existance Testing
   ****************************************************************************/

  it('should contain the browserInitData service',
    function () {
      expect(browserInitData).not.toEqual(null);
    }
  );


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should resolve a promise',
    function () {
      var results;

      spyOn(viewData, "getView")
        .andCallFake(function() {
          var deferred = $q.defer();
          deferred.resolve('test');
          return deferred.promise;
        });

      $httpBackend
        .expectGET('http://sbb.cellfinder.org/api/1.2.3/test')
        .respond(200);

      browserInitData().then(function(data){
        results = data;
      });

      $rootScope.$digest();

      expect(results).toEqual('test');
    }
  );

  it('should return `null` if promise is rejected',
    function () {
      var results;

      spyOn(viewData, "getView")
        .andCallFake(function() {
          var deferred = $q.defer();
          deferred.reject('test');
          return deferred.promise;
        });

      $httpBackend
        .expectGET('http://sbb.cellfinder.org/api/1.2.3/test')
        .respond(200);

      browserInitData()
        .then(function(data){
          results = data;
        });

      $rootScope.$digest();

      expect(results).toEqual(null);
    }
  );

});
