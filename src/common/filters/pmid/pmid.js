angular
  .module( 'pmid', [])
  .filter( 'pmid', [
    function() {
      /*
       * Transforms a PubMed ID into a valid URL
       */
      return function( pmid ) {
        var url = null;
        if (typeof pmid === 'string') {
          url = 'http://www.ncbi.nlm.nih.gov/pubmed/' + pmid;
        }
        return url;
      };
    }
  ]);
