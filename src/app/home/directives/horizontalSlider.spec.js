describe('home.directive.horizontalSlider (unit testing)', function () {
  'use strict';

  var $rootScope,
      $compile,
      $scope,
      $parentScope,
      element;

  beforeEach(function () {
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

  /*
   * ---------------------------------------------------------------------------
   * General / Existance testing
   * ---------------------------------------------------------------------------
   */
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
      $parentScope.data = [{
        name: 'test',
        sub: [{
          link: 'test',
          species: 'test',
          stage: 'test'
        }],
      }];
      $parentScope.$digest();

      expect($scope.data).toEqual($parentScope.data);
    }
  );

  /*
   * ---------------------------------------------------------------------------
   * Functional testing
   * ---------------------------------------------------------------------------
   */
  it('should be scrollable when the number of results > number visual',
    function () {
      $parentScope.data = {
        testA: {
          name: 'test',
          sub: [{
            link: 'test',
            species: 'test',
            stage: 'test'
          }],
        },
        testB: {
          name: 'test',
          sub: [{
            link: 'test',
            species: 'test',
            stage: 'test'
          }],
        },
        testC: {
          name: 'test',
          sub: [{
            link: 'test',
            species: 'test',
            stage: 'test'
          }],
        }
      };
      $parentScope.$digest();

      $rootScope.$broadcast('ngRepeatFinished');
      $rootScope.$digest();

      expect($scope.scrollable).toEqual(true);

      $parentScope.data = {
        testA: {
          name: 'test',
          sub: [{
            link: 'test',
            species: 'test',
            stage: 'test'
          }],
        }
      };
      $parentScope.$digest();

      $rootScope.$broadcast('ngRepeatFinished');
      $rootScope.$digest();

      expect($scope.scrollable).toEqual(false);
    }
  );

  it('should change the margin when invoking the scroll function',
    function () {
      var ul = angular.element(element[0].querySelector('ul'));

      $parentScope.data = {
        testA: {
          name: 'test',
          sub: [{
            link: 'test',
            species: 'test',
            stage: 'test'
          }],
        },
        testB: {
          name: 'test',
          sub: [{
            link: 'test',
            species: 'test',
            stage: 'test'
          }],
        },
        testC: {
          name: 'test',
          sub: [{
            link: 'test',
            species: 'test',
            stage: 'test'
          }],
        }
      };
      $rootScope.$digest();

      $rootScope.$broadcast('ngRepeatFinished');
      $rootScope.$digest();

      $scope.scroll('next');
      $rootScope.$digest();

      expect(ul.css('margin-left')).toEqual('-50%');

      $scope.scroll('next');
      $rootScope.$digest();

      expect(ul.css('margin-left')).toEqual('-100%');

      $scope.scroll('next');
      $rootScope.$digest();

      expect(ul.css('margin-left')).toEqual('0%');

      /*
       * Prev should also work
       */
      $scope.scroll('prev');
      $rootScope.$digest();

      expect(ul.css('margin-left')).toEqual('-100%');
    }
  );
});
