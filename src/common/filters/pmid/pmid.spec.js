describe('pmid (unit testing)', function () {
  'use strict';

  var pmid,
      pubmedBaseUrl = 'http://www.ncbi.nlm.nih.gov/pubmed/';

  beforeEach(function () {
    module('pmid');

    inject(function (_$filter_) {
      pmid = _$filter_('pmid');
    });
  });

  it('should contain the pmid service',
    function () {
      expect(pmid).not.toEqual(null);
    }
  );

  it('should return null if no input',
    function () {
      expect(pmid()).toEqual(null);
    }
  );

  it('should return a string if an input exists',
    function () {
      expect(typeof(pmid('123'))).toEqual('string');
    }
  );

  it('should return a URL if an input exists',
    function () {
      var id = 123;

      expect(pmid(id)).toEqual(pubmedBaseUrl + id.toString());
    }
  );
});
