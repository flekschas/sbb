describe("app.common.directive.sbbAbout (unit testing)", function() {
  "use strict";

  var $rootScope,
      $compile,
      $scope,
      element;

  beforeEach(function(){
    module('sbb');

    inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');

      element = '<div id="directive" sbb-about></div><div id="other"></div>';

      element = $compile(element)($rootScope.$new());
      $rootScope.$digest();

      $scope = element.scope();
    });
  });

  it('should have a toggle function',
    function () {
      expect(typeof($scope.toggle)).toEqual('function');
    }
  );

  it('should be closed by default',
    function () {
      expect($scope.open).toEqual(false);
    }
  );

  it('should toggle the `open` attribute',
    function () {
      expect($scope.open).toEqual(false);
      $scope.toggle();
      $rootScope.$digest();
      expect($scope.open).toEqual(true);
    }
  );

  it('should listen to the global click event and set `open` to `false`',
    inject(function ($injector) {
      /*
       * First open the drop down.
       */
      $scope.toggle();
      $rootScope.$digest();
      expect($scope.open).toEqual(true);

      /*
       * Manually fire the global click event using the news service.
       * 1. Test closing (set open  to `false`)
       * 2. Test kepping the drop down open
       */
      var news = $injector.get('news');

      news.broadcast('click', element[0].querySelector('#other'));  // (1)
      $rootScope.$digest();
      expect($scope.open).toEqual(false);

      $scope.toggle();
      $rootScope.$digest();
      news.broadcast('click', element[0].querySelector('.triangle'));  // (2)
      $rootScope.$digest();
      expect($scope.open).toEqual(true);
    })
  );

  it('`open` should set class',
    function () {
      expect(element[0].querySelector('#logo.active')).toEqual(null);
      expect(element[0].querySelector('div.container.open')).toEqual(null);
      $scope.toggle();
      $rootScope.$digest();
      expect(element[0].querySelector('#logo.active')).toBeTruthy();
      expect(element[0].querySelector('div.container.open')).toBeTruthy();
    }
  );
});
