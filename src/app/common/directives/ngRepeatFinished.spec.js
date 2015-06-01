describe('app.common.directive.ngRepeatFinished (unit testing)', function () {
  'use strict';

  var $rootScope,
      $compile,
      $timeout,
      $scope,
      element;

  beforeEach(function () {
    module('sbb');

    inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
      $timeout = $injector.get('$timeout');
      $scope = $rootScope.$new();

      element = '<div><p ng-repeat="test in tests track by $index" id="p-{{ $' +
       'index }}" ng-repeat-finished>{{ test }}</p></div>';
      element = $compile(element)($scope);

      spyOn($rootScope, '$broadcast');
    });
  });

  it('should broadcast that ngRepeat finished rendering',
    function () {
      $scope.tests = [1, 2, 3];
      $scope.$digest();
      $timeout.flush();

      expect($rootScope.$broadcast)
        .toHaveBeenCalledWith(
          'ngRepeatFinished',
          angular.element(element[0].querySelector('#p-2')),
          undefined
        );
    }
  );
});
