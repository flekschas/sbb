angular
  .module( 'sbb' )
  .constant( 'settings', {
    apiPath: 'http://sbb.cellfinder.org/api/1.2.2/',
    ebiBS: 'https://www.ebi.ac.uk/rdf/services/biosamples/sparql',
    ebiGXA: 'https://www.ebi.ac.uk/rdf/services/atlas/sparql',
    illuPath: 'assets/illustrations/',
    partialsPath: './partials/',
    maxBookmarks: 5
  });
