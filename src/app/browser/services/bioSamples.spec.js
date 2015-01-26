describe("browser.service.bioSamples (unit testing)", function() {
  "use strict";

  /*****************************************************************************
   * Global Variables
   ****************************************************************************/

  var $rootScope,
      $httpBackend,
      bioSamples,
      settings,
      fakeExpData = {
        results: {
          bindings: [{
            exp: {
              value: 'testA1'
            },
            acc: {
              value: 'testB1'
            }
          },
          {
            exp: {
              value: 'testA2'
            },
            acc: {
              value: 'testB2'
            }
          }]
        }
      },
      fakeExpDataResponse = [
        {
          exp: 'testA1',
          acc: 'testB1',
          desc: null,
          repo: null,
          title: null,
          url: null
        },
        {
          exp: 'testA2',
          acc: 'testB2',
          desc: null,
          repo: null,
          title: null,
          url: null
        }
      ],
      fakeExpDetails = {
        results: {
          bindings: [{
            testA: {
              value: 'testA1'
            },
            people: {
              value: 'testB1'
            }
          },
          {
            testA: {
              value: 'testA2'
            },
            people: {
              value: 'TestB2'
            }
          }]
        }
      },
      fakeExpDetailsResponse = {
        testA: [
          'testA1',
          'testA2'
        ],
        people: [
          'test B1',
          'Test B2'
        ]
      },
      fakeExpSparql = function (uri, species) {
        var sparql = '';

        sparql += 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n';
        sparql += 'PREFIX dcterms: <http://purl.org/dc/terms/>\n';
        sparql += 'PREFIX obo: <http://purl.obolibrary.org/obo/>\n';
        sparql += 'PREFIX biosd: <http://rdf.ebi.ac.uk/terms/biosd/>\n';

        sparql += 'SELECT DISTINCT ?exp ?title ?desc ?repo ?acc ?url ?pmid\n';
        sparql += 'WHERE {\n';

        /*
         * Get samples with a bio characteristics.
         */
        sparql += '  ?sample\n';
        sparql += '    a biosd:Sample ;\n';
        sparql += '    biosd:has-bio-characteristic ?bioChar ;\n';
        sparql += '    <http://semanticscience.org/resource/SIO_000332> ?about .\n';

        /*
         * Specify species.
         */
        sparql += '  ?about\n';
        sparql += '    biosd:has-bio-characteristic-type [a obo:' + species + '] .\n';

        /*
         * Define the bio characteristic which is the anatomical entitiy.
         */
        sparql += '  ?bioChar\n';
        sparql += '    biosd:has-bio-characteristic-type [a obo:' + uri + '] .\n';

        /*
         * Get experiment the samples is associated to.
         */
        sparql += '  ?exp\n';
        sparql += '    obo:IAO_0000219 ?sample ;\n';
        sparql += '    rdfs:label ?title ;\n';
        sparql += '    <http://purl.org/pav/2.0/derivedFrom> ?webRec ;\n';
        sparql += '    rdfs:comment ?desc .\n';

        /*
         * Specify species.
         */
        sparql += '  ?webRec\n';
        sparql += '    dcterms:identifier ?acc;\n';
        sparql += '    dcterms:source ?repo;\n';
        sparql += '    <http://xmlns.com/foaf/0.1/page> ?url.\n';
        sparql += '}';

        return sparql;
      },
      fakeExpDetailsSparql = function (uri) {
        var sparql = '',
            expResource = '<' + uri + '>';

        sparql += 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n';
        sparql += 'PREFIX dcterms: <http://purl.org/dc/terms/>\n';
        sparql += 'PREFIX obo: <http://purl.obolibrary.org/obo/>\n';
        sparql += 'PREFIX biosd: <http://rdf.ebi.ac.uk/terms/biosd/>\n';

        sparql += 'SELECT DISTINCT ?pmid ?orgs ?people\n';
        sparql += 'WHERE {\n';

        /*
         * Get PubMed IDs
         */
        sparql += '  {\n';
        sparql += '    ?publication\n';
        sparql += '      obo:IAO_0000136 ' + expResource + ' ;\n';
        sparql += '      <http://purl.org/ontology/bibo/pmid> ?pmid .\n';
        sparql += '  }\n';

        /*
         * Get organisations
         */
        sparql += '  UNION\n';
        sparql += '  {\n';
        sparql += '    ' + expResource + '\n';
        sparql += '      biosd:has-knowledgeable-organization ?expOrg .\n';
        sparql += '    ?expOrg\n';
        sparql += '      rdfs:label ?orgs .\n';
        sparql += '  }\n';

        /*
         * Get people
         */
        sparql += '  UNION\n';
        sparql += '  {\n';
        sparql += '    ' + expResource + '\n';
        sparql += '      biosd:has-knowledgeable-person ?expPeople .\n';
        sparql += '    ?expPeople\n';
        sparql += '      rdfs:label ?people .\n';
        sparql += '  }\n';
        sparql += '}';

        return sparql;
      },
      encodeUriQuery = function (val) {
        return encodeURIComponent(val).
                   replace(/%40/gi, '@').
                   replace(/%3A/gi, ':').
                   replace(/%24/g, '$').
                   replace(/%2C/gi, ',').
                   replace(/%3B/gi, ';').
                   replace(/%20/g, '+');
      },
      urlParams = function (params) {
        return  Object.keys(params).sort().map(function(key) {
          return encodeUriQuery(key) + "=" + encodeUriQuery(params[key]);
        }).join('&');
      };


  /*****************************************************************************
   * Global Setting / Setup
   ****************************************************************************/

  beforeEach(function() {
    module('sbb');
    module('sbb.browser');

    inject(function ($injector) {
      bioSamples = $injector.get('bioSamples');

      $rootScope = $injector.get('$rootScope');
      $httpBackend = $injector.get('$httpBackend');
      settings = $injector.get('settings');
    });
  });


  /*****************************************************************************
   * General / Existance Testing
   ****************************************************************************/

  it('should contain the bioSamples',
    function () {
      expect(bioSamples).not.toEqual(null);
    }
  );

  it('exists the `getExp` function',
    function () {
      expect(typeof(bioSamples.getExp)).toEqual('function');
    }
  );

  it('exists the `getExpDetails` function',
    function () {
      expect(typeof(bioSamples.getExpDetails)).toEqual('function');
    }
  );


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should resolve promises and cache results for `getExp`',
    function () {
      var uri= 'test',
          species = 'human',
          params = {
            query: fakeExpSparql(uri, species),
            offset: 0,
            inference: 'false'
          },
          bioSamplesData;

      $httpBackend
        .expectGET(
          settings.ebiBS +'?'+ urlParams(params),
          {
            "Accept": "application/sparql-results+json"
          }
        )
        .respond(fakeExpData);

      bioSamples
        .getExp(uri, species)
        .then(function (data){
          bioSamplesData = data;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(bioSamplesData).toEqual(fakeExpDataResponse);

      /*
       * Reults should now be cached so we don't expect another http request
       */

      bioSamplesData = undefined;
      $rootScope.$digest();

      bioSamples
        .getExp(uri, species)
        .then(function (data){
          bioSamplesData = data;
        });
      $rootScope.$digest();

      expect(bioSamplesData).toEqual(fakeExpDataResponse);

      /*
       * If nothing is found the results should be set to `null`
       */

      params.query = fakeExpSparql(uri + uri, species);

      $httpBackend
        .expectGET(
          settings.ebiBS +'?'+ urlParams(params),
          {
            "Accept": "application/sparql-results+json"
          }
        )
        .respond({
          results: {
            bindings: []
          }
        });

      bioSamples
        .getExp(uri + uri, species)
        .then(function (data){
          bioSamplesData = data;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(bioSamplesData).toEqual(null);
    }
  );

  it('should reject errors for `getExp`',
    function () {
      var uri= 'test',
          species = 'human',
          params = {
            query: fakeExpSparql(uri, species),
            offset: 0,
            inference: 'false'
          },
          bioSamplesErr;

      $httpBackend
        .expectGET(
          settings.ebiBS +'?'+ urlParams(params),
          {
            "Accept": "application/sparql-results+json"
          }
        )
        .respond(500, 'error');

      bioSamples
        .getExp(uri, species)
        .catch(function (e) {
          bioSamplesErr = e;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(bioSamplesErr).toEqual('error');
    }
  );

  it('should resolve promises and cache results for `getExpDetails`',
    function () {
      var uri= 'test',
          species = 'human',
          params = {
            query: fakeExpDetailsSparql(uri),
            offset: 0,
            inference: 'false'
          },
          bioSamplesData;

      $httpBackend
        .expectGET(
          settings.ebiBS +'?'+ urlParams(params),
          {
            "Accept": "application/sparql-results+json"
          }
        )
        .respond(fakeExpDetails);

      bioSamples
        .getExpDetails(uri)
        .then(function (data){
          bioSamplesData = data;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(bioSamplesData).toEqual(fakeExpDetailsResponse);

      /*
       * Results should now be cached so we don't expect another http request
       */

      bioSamplesData = undefined;
      $rootScope.$digest();

      bioSamples
        .getExpDetails(uri)
        .then(function (data){
          bioSamplesData = data;
        });
      $rootScope.$digest();

      expect(bioSamplesData).toEqual(fakeExpDetailsResponse);

      /*
       * If nothing is found the results should be set to `null`
       */

      params.query = fakeExpDetailsSparql(uri + uri);

      $httpBackend
        .expectGET(
          settings.ebiBS +'?'+ urlParams(params),
          {
            "Accept": "application/sparql-results+json"
          }
        )
        .respond({
          results: {
            bindings: []
          }
        });

      bioSamples
        .getExpDetails(uri + uri)
        .then(function (data){
          bioSamplesData = data;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(bioSamplesData).toEqual(null);
    }
  );

  it('should reject errors for `getExpDetails`',
    function () {
      var uri= 'test',
          params = {
            query: fakeExpDetailsSparql(uri),
            offset: 0,
            inference: 'false'
          },
          bioSamplesErr;

      $httpBackend
        .expectGET(
          settings.ebiBS +'?'+ urlParams(params),
          {
            "Accept": "application/sparql-results+json"
          }
        )
        .respond(500, 'error');

      bioSamples
        .getExpDetails(uri)
        .catch(function (e) {
          bioSamplesErr = e;
        });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(bioSamplesErr).toEqual('error');
    }
  );

});
