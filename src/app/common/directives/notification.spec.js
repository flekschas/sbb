describe("app.common.directive.notification (unit testing)", function() {
  "use strict";

  /*****************************************************************************
   * Global Variables
   ****************************************************************************/

  var $rootScope,
      $compile,
      $timeout,
      scope,
      baseEl,
      element;


  /*****************************************************************************
   * Global Setting / Setup
   ****************************************************************************/

  beforeEach(function(){
    module('sbb');

    inject(function ($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
      $timeout = $injector.get('$timeout');

      baseEl = '<div><sbb-notification></sbb-notification></div>';
      baseEl = $compile(baseEl)($rootScope.$new());

      $rootScope.$digest();

      element = angular.element(baseEl[0].querySelector('#sbb-notification'));
      scope = element.scope();
    });
  });


  /*****************************************************************************
   * General / Existance Testing
   ****************************************************************************/

  it('should have a `close` function',
    function () {
      expect(typeof(scope.close)).toEqual('function');
    }
  );

  it('should be closed by default',
    function () {
      expect(scope.show).toEqual(false);
    }
  );


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should open when `open` event is broadcasted',
    function () {
      var data = {
        type: 'success',
        message: 'message'
      };

      $rootScope.$broadcast('sbbNotification:open', data);
      $rootScope.$digest();

      expect(scope.type).toEqual(data.type);
      expect(scope.message).toEqual(data.message);
      expect(scope.show).toEqual(true);
    }
  );

  it('should close when the `close` event is broadcasted',
    function () {
      $rootScope.$broadcast('sbbNotification:open', {
        type: 'success'
      });
      $rootScope.$digest();

      expect(scope.show).toEqual(true);

      $rootScope.$broadcast('sbbNotification:close');
      $rootScope.$digest();

      expect(scope.show).toEqual(false);
    }
  );

  it('should close when the `close` button is clicked',
    function () {
      $rootScope.$broadcast('sbbNotification:open', {
        type: 'success'
      });
      $rootScope.$digest();

      expect(scope.show).toEqual(true);

      angular
        .element(element[0].querySelector('.close'))
        .triggerHandler('click');

      $rootScope.$digest();

      expect(scope.show).toEqual(false);
    }
  );

  it('should set notification type and icon properly',
    function () {
      $rootScope.$broadcast('sbbNotification:open', {
        type: 'success'
      });
      $rootScope.$digest();

      expect(scope.type).toEqual('success');
      expect(scope.icon).toEqual('checkmark-circle');

      $rootScope.$broadcast('sbbNotification:open', {
        type: 'error'
      });
      $rootScope.$digest();

      expect(scope.type).toEqual('error');
      expect(scope.icon).toEqual('warning');

      $rootScope.$broadcast('sbbNotification:open', {
        type: 'test'
      });
      $rootScope.$digest();

      expect(scope.type).toEqual('info');
      expect(scope.icon).toEqual('info-circle');
    }
  );
});
