describe('containElement (unit testing)', function () {
  'use strict';

  var containElement,
      $rootScope,
      $compile,
      element;

  beforeEach(function () {
    module('containElement');

    inject(function (_containElement_, $injector) {
      containElement = _containElement_;
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');

      element = angular.element('<section>' +
        '<div id="a"><h2>A</h2><p id="a_p">Test A</p></div>' +
        '<div id="b"><h2>B</h2><p id="b_p">Test B</p></div>' +
        '</section>');

      element = $compile(element)($rootScope);
      $rootScope.$digest();
    });
  });

  it('should contain the containElement service', function () {
    expect(containElement).not.toEqual(null);
  });

  it('should return false if target element is not a child of the search element',
    function () {
      var search = element[0].querySelector('#a'),
          target = element[0].querySelector('#b_p');

      expect(containElement(search, target)).toEqual(false);
    }
  );

  it('should return true if target element is a child of the search element',
    function () {
      var search = element[0].querySelector('#a'),
          target = element[0].querySelector('#a_p');

      expect(containElement(search, target)).toEqual(true);
    }
  );

});
