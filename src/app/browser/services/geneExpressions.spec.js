describe('browser.service.geneExpressions (unit testing)', function () {
  'use strict';

  /*
   * ---------------------------------------------------------------------------
   * Global Variables
   * ---------------------------------------------------------------------------
   */
  var $rootScope,
      $httpBackend,
      geneExpressions,
      settings,
      fakegeneExpressions = ['abc'];

  /*
   * ---------------------------------------------------------------------------
   * Global Setting / Setup
   * ---------------------------------------------------------------------------
   */
  beforeEach(function () {
    module('sbb');
    module('sbb.browser');

    inject(function ($injector) {
      geneExpressions = $injector.get('geneExpressions');

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
  it('should contain the geneExpressions',
    function () {
      expect(geneExpressions).not.toEqual(null);
    }
  );

  it('exists the `get` function',
    function () {
      expect(typeof(geneExpressions.get)).toEqual('function');
    }
  );

  /*
   * ---------------------------------------------------------------------------
   * Functional Testing
   * ---------------------------------------------------------------------------
   */
  it('should resolve promises',
    function () {
      var dataset = 'test',
          genes = ['testGeneA', 'testGeneB'],
          expressions;

      $httpBackend
        .expectGET(settings.apiPath + 'expression/' + dataset + '/' + genes.join('_'))
        .respond(fakegeneExpressions);

      geneExpressions
        .get(dataset, genes)
        .then(function (data) {
          expressions = data;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(expressions).toEqual(fakegeneExpressions);
    }
  );

  it('should reject errors',
    function () {
      var dataset = 'test',
          genes = ['testGeneA', 'testGeneB'],
          geneExpressionsErr;

      $httpBackend
        .expectGET(settings.apiPath + 'expression/' + dataset + '/' + genes.join('_'))
        .respond(500, 'error');

      geneExpressions
        .get(dataset, genes)
        .catch(function (e) {
          geneExpressionsErr = e;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(geneExpressionsErr).toEqual('error');
    }
  );
});
