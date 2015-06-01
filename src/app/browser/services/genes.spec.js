describe('browser.service.genes (unit testing)', function () {
  'use strict';

  /*
   * ---------------------------------------------------------------------------
   * Global Variables
   * ---------------------------------------------------------------------------
   */
  var $rootScope,
      $httpBackend,
      genes,
      settings,
      fakeGenes = ['abc'];

  /*
   * ---------------------------------------------------------------------------
   * Global Setting / Setup
   * ---------------------------------------------------------------------------
   */
  beforeEach(function () {
    module('sbb');
    module('sbb.browser');

    inject(function ($injector) {
      genes = $injector.get('genes');

      $rootScope = $injector.get('$rootScope');
      $httpBackend = $injector.get('$httpBackend');
      settings = $injector.get('settings');
    });
  });

  /*
   * ---------------------------------------------------------------------------
   * General / Existance Testing
   * ---------------------------------------------------------------------------
   */
  it('should contain the genes',
    function () {
      expect(genes).not.toEqual(null);
    }
  );

  it('exists the `getAll` function',
    function () {
      expect(typeof(genes.getAll)).toEqual('function');
    }
  );

  /*
   * ---------------------------------------------------------------------------
   * Functional Testing
   * ---------------------------------------------------------------------------
   */
  it('should resolve promises',
    function () {
      var geneData;

      $httpBackend
        .expectGET(settings.apiPath + 'genes')
        .respond(fakeGenes);

      genes
        .getAll()
        .then(function (data) {
          geneData = data;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(geneData).toEqual(fakeGenes);
    }
  );

  it('should reject errors',
    function () {
      var genesErr;

      $httpBackend
        .expectGET(settings.apiPath + 'genes')
        .respond(500, 'error');

      genes
        .getAll()
        .catch(function (e) {
          genesErr = e;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(genesErr).toEqual('error');
    }
  );
});
