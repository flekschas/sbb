describe("app.controller (unit testing)", function() {
  "use strict";

  /*****************************************************************************
   * Global Variables
   ****************************************************************************/

  var AppCtrl,
      appScope,
      $rootScope,
      storage;


  /*****************************************************************************
   * Global Setting / Setup
   ****************************************************************************/

  beforeEach(function() {
    module('sbb');

    inject(function ($injector) {
      var $controller = $injector.get('$controller');

      storage = $injector.get('storage');
      $rootScope = $injector.get('$rootScope');

      appScope = $rootScope.$new();

      AppCtrl = $controller('AppCtrl as app', {
        $scope: appScope,
        storage: storage
      });
    });
  });


  /*****************************************************************************
   * General / Existance Testing
   ****************************************************************************/

  it('should have the AppCtrl',
    function() {
      expect(AppCtrl).toBeTruthy();
    }
  );

  it('should have the `globalClick` function',
    function() {
      expect(typeof(AppCtrl.globalClick)).toEqual('function');
    }
  );

  it('should have the `ready` function',
    function() {
      expect(typeof(AppCtrl.ready)).toEqual('function');
    }
  );


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should set app status correctly',
    function() {
      /*
       * App status should be undefined before the `$routeChangeStart` event has
       * been triggered.
       */
      expect(typeof(appScope.app.status)).toEqual('undefined');

      /*
       * After `$routeChangeStart` has been triggered the app status should be
       * `loading`.
       */
      $rootScope.$broadcast('$routeChangeStart', {});
      $rootScope.$digest();

      expect(appScope.app.status).toEqual('loading');

      /*
       * Finally, after calling `ready()` the app status should be `ready`.
       */
      AppCtrl.ready();
      $rootScope.$digest();

      expect(appScope.app.status).toEqual('ready');
    }
  );

  it('should set the title according to the `$routeChangeStart` currentRoute title',
    function() {

      $rootScope.$broadcast('$routeChangeStart', {title: 'test'});
      $rootScope.$digest();

      expect(appScope.app.title).toEqual('test');
    }
  );

  it('should set the title according to the `$location` if currentRoute title is unavailable',
    inject(function($location) {
      $location.path('/this-is-a-test');

      $rootScope.$broadcast('$routeChangeStart', {});
      $rootScope.$digest();

      expect(appScope.app.title).toEqual('This Is A Test');
    })
  );

  it('should store last visited',
    function() {
      $rootScope.$broadcast('$routeChangeStart', {});
      $rootScope.$digest();

      expect(storage.get('lastVisit')).toEqual(Math.floor(Date.now() / 86400000));
    }
  );

  it('should broadcast click target when `globalClick` is called',
    inject(function ($injector) {
      var event = {
        target: 'test'
      };

      spyOn($rootScope, '$broadcast');

      AppCtrl.globalClick(event);

      expect($rootScope.$broadcast).toHaveBeenCalledWith('click', event.target, undefined);
    })
  );
});
