describe("home.directive.horizontalSlider (unit testing)", function() {
  "use strict";

  var $rootScope,
      $compile,
      $scope,
      $parentScope,
      element;

  beforeEach(function(){
    module('sbb');
    module('sbb.home');

    inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');

      element = '<horizontal-slider id="directive" data="data" num-visible-items="2"></horizontal-slider>';

      $parentScope = $rootScope.$new();

      element = $compile(element)($parentScope);
      $rootScope.$digest();

      // Because the tag `horizontal-slider` is not replaced it still as the
      // root scope which is why we have to fetch the child scope. As there is
      // only one child scope we are free to use `$$childHead` or `$$childTail`
      $scope = element.scope().$$childHead;
    });
  });


  /*****************************************************************************
   * General / Existing
   ****************************************************************************/

  it('should have a scroll function',
    function () {
      expect(typeof($scope.scroll)).toEqual('function');
    }
  );

  it('should not be scrollable by default',
    function () {
      expect($scope.scrollable).toEqual(false);
    }
  );

  it('should show 2 hits a time',
    function () {
      expect($scope.numVisibleItems).toEqual('2');
    }
  );

  it('should have a data object',
    function () {
      $parentScope.data = {
        name: 'test',
        sub: [{
          link: 'test',
          species: 'test',
          stage: 'test'
        }],
      };
      $parentScope.$digest();

      expect($scope.data).toEqual($parentScope.data);
    }
  );


  /*****************************************************************************
   * General / Existing
   ****************************************************************************/

  // it('should toggle the `open` attribute',
  //   function () {
  //     expect($scope.open).toEqual(false);
  //     $scope.toggle();
  //     $rootScope.$digest();
  //     expect($scope.open).toEqual(true);
  //   }
  // );

  // it('should listen to the global click event and set `open` to `false`',
  //   inject(function ($injector) {
  //     /*
  //      * First open the drop down.
  //      */
  //     $scope.toggle();
  //     $rootScope.$digest();
  //     expect($scope.open).toEqual(true);


  //      * Manually fire the global click event using the news service.
  //      * 1. Test closing (set open  to `false`)
  //      * 2. Test kepping the drop down open

  //     var news = $injector.get('news');

  //     news.setClick(element[0].querySelector('#other'));  // (1)
  //     $rootScope.$digest();
  //     expect($scope.open).toEqual(false);

  //     $scope.toggle();
  //     $rootScope.$digest();
  //     news.setClick(element[0].querySelector('.triangle'));  // (2)
  //     $rootScope.$digest();
  //     expect($scope.open).toEqual(true);
  //   })
  // );

  // it('`open` should set class',
  //   function () {
  //     expect(element[0].querySelector('#logo.active')).toEqual(null);
  //     expect(element[0].querySelector('div.container.open')).toEqual(null);
  //     $scope.toggle();
  //     $rootScope.$digest();
  //     expect(element[0].querySelector('#logo.active')).toBeTruthy();
  //     expect(element[0].querySelector('div.container.open')).toBeTruthy();
  //   }
  // );
});
