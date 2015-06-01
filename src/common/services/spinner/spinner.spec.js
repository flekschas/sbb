describe('SbbSpinner (unit testing)', function () {
  'use strict';

  var SbbSpinner,
      $timeout,
      paper;

  beforeEach(function () {
    // Define `Raphael` as Raphael for dependency injection.
    module(function ($provide) {
      $provide.value('Raphael', Raphael);
    });

    module('SbbSpinner');

    inject(function (_SbbSpinner_, $injector) {
      SbbSpinner = _SbbSpinner_;

      paper = new Raphael(0, 0, 100, 100);
    });
  });

  it('should contain the SbbSpinner service',
    function () {
      expect(SbbSpinner).not.toEqual(null);
    }
  );

  it('should return a function',
    function () {
      var spinner = new SbbSpinner(paper, 100, 100);

      expect(typeof(spinner)).toEqual('function');
    }
  );

  it('should find 12 paths with standard settings',
    function () {
      var spinner = new SbbSpinner(paper, 100, 100),
          i = 0;

      paper.forEach(function (el) {
        i++;
      });

      expect(i).toEqual(12);
    }
  );
});
