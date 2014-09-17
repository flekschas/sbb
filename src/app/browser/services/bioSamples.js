angular
  .module( 'sbb.browser' )
  .factory( 'bioSamples', ['$cacheFactory', '$http', '$q', 'settings',
    function($cacheFactory, $http, $q, settings) {
      var bs = this;

      bs.exp = $cacheFactory('bioSamplesExp', {
        number: 5
      });

      bs.expDetails = $cacheFactory('bioSamplesExpDetails', {
        number: 5
      });

      function getExp ( uri, species ) {
        var deferred = $q.defer(),
            results,
            sparql = '';

        /*
         * Look for cached results first.
         */
        results = bs.exp.get(uri);
        if (results) {
          deferred.resolve(results);
          return deferred.promise;
        }

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

        /*
         * Specify species.
         */
        sparql += '  ?about\n';
        sparql += '    biosd:has-bio-characteristic-type ?aboutType .\n';
        sparql += '  ?aboutType\n';
        sparql += '    a obo:' + species + ' .\n';

        /*
         * Define the bio characteristic which is the anatomical entitiy.
         */
        sparql += '  ?bioChar\n';
        sparql += '    biosd:has-bio-characteristic-type ?bioCharType.\n';
        sparql += '  ?bioCharType\n';
        sparql += '    a obo:' + uri + ' .\n';
        sparql += '}';

        /*
         * Work around as POST isn't implemented yet but will be in a month.
         */
        $http({
          url: settings.ebiBS,
          method: "GET",
          headers: {
              "Accept": "application/sparql-results+json"
          },
          params: {
            query: sparql,
            // limit: 10,
            offset: 0,
            inference: 'false'
          }
        })
        .success(function ( data ) {
          console.log(data);
          data = parseSparqlResults(data.results.bindings);
          deferred.resolve(data);
        })
        .error(function ( error ) {
          deferred.reject(error);
        });

        /*
         * Organise results to avoid errors when properties are missing.
         */
        function parseSparqlResults ( data ) {

          console.log(data);
          results = [];

          for (var i = 0; i < data.length; i++) {
            results.push({
              exp: null,
              acc: null,
              desc: null,
              repo: null,
              title: null,
              url: null
            });

            for (var prop in data[i]) {
              if (data[i].hasOwnProperty(prop)) {
                results[i][prop] = data[i][prop].value;
              }
            }
          }

          /*
           * Cache data for later use
           */
          bs.exp.put(uri, results === undefined ? null : results);

          return results;
        }

        /*
         * POST request
         *
         * Currently not supported by the BioSamples SPARQL endpoint but will
         * be supported soon.
         */
        // $http({
        //   url: settings.ebiBS,
        //   method: "POST",
        //   headers: {
        //      "Content-Type": "application/sparql-query"
        //   },
        //   data: {
        //     query: sparql,
        //     format: 'JSON',
        //     limit: 10,
        //     offset: 0,
        //     inference: 'false'
        //   }
        // })
        // .success(function (data) {
        //   deferred.resolve(data);
        // })
        // .error(function (error) {
        //   deferred.reject(error);
        // });

        return deferred.promise;
      }

      function getExpDetails ( expUri ) {
        var deferred = $q.defer(),
            results,
            sparql = '',
            expResource = '<' + expUri + '>';

        /*
         * Look for cached results first.
         */
        results = bs.expDetails.get(expUri);
        if (results) {
          deferred.resolve(results);
          return deferred.promise;
        }

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

        /*
         * Work around as POST isn't implemented yet but will be in a month.
         */
        $http({
          url: settings.ebiBS,
          method: "GET",
          headers: {
              "Accept": "application/sparql-results+json"
          },
          params: {
            query: sparql,
            offset: 0,
            inference: 'false'
          }
        })
        .success(function ( data ) {
          data = parseSparqlResults(data.results.bindings);
          deferred.resolve(data);
        })
        .error(function ( error ) {
          deferred.reject(error);
        });

        /*
         * Organise results to avoid errors when properties are missing.
         */
        function parseSparqlResults ( data ) {
          results = {};

          for (var i = 0; i < data.length; i++) {
            for (var prop in data[i]) {
              if (data[i].hasOwnProperty(prop)) {
                if (results[prop] === undefined) {
                  results[prop] = [data[i][prop].value];
                } else {
                  results[prop].push(data[i][prop].value);
                }
              }
            }
          }

          if (results.people) {
            for (var j = results.people.length - 1; j >= 0; j--) {
              results.people[j] = results.people[j][0] + results.people[j].substr(1).replace(/([A-Z])/g, ' $1');
            }
          }

          /*
           * Cache data for later use
           */
          bs.expDetails.put(expUri, results === undefined ? null : results);

          return results;
        }

        /*
         * POST request
         *
         * Currently not supported by the BioSamples SPARQL endpoint but will
         * be supported soon.
         */
        // $http({
        //   url: settings.ebiBS,
        //   method: "POST",
        //   headers: {
        //      "Content-Type": "application/sparql-query"
        //   },
        //   data: {
        //     query: sparql,
        //     format: 'JSON',
        //     limit: 10,
        //     offset: 0,
        //     inference: 'false'
        //   }
        // })
        // .success(function (data) {
        //   deferred.resolve(data);
        // })
        // .error(function (error) {
        //   deferred.reject(error);
        // });

        return deferred.promise;
      }

      return {
        getExp: getExp,
        getExpDetails: getExpDetails
      };
    }
  ]);
