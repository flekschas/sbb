describe("app.service.storage (unit testing)", function() {
  "use strict";

  /*****************************************************************************
   * Global Variables
   ****************************************************************************/

  var localFakeStorage = {},
      storage,
      $rootScope;


  /*****************************************************************************
   * Global Setting / Setup
   ****************************************************************************/

  beforeEach(function() {
    module('sbb');

    spyOn(localStorage, 'getItem').and.callFake(function(key) {
      return localFakeStorage[key];
    });
    spyOn(localStorage, 'setItem').and.callFake(function(key, value) {
      localFakeStorage[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake(function(key) {
      localFakeStorage[key] = null;
    });

    inject(function ($injector) {
      storage = $injector.get('storage');
      $rootScope = $injector.get('$rootScope');
    });

    $rootScope.$digest();
  });


  /*****************************************************************************
   * General / Existance Testing
   ****************************************************************************/

  it('should exist the storage service',
    function () {
      expect(storage).not.toEqual(null);
    }
  );

  it('exists the `set` function',
    function () {
      expect(typeof(storage.set)).toEqual('function');
    }
  );

  it('exists the `get` function',
    function () {
      expect(typeof(storage.get)).toEqual('function');
    }
  );

  it('exists the `persistent` function',
    function () {
      expect(typeof(storage.persistent)).toEqual('boolean');
    }
  );

  it('should have tested for `localStorage` support',
    function () {
      expect(localStorage.setItem).toHaveBeenCalledWith('SBB/test', 'test');
      expect(localStorage.removeItem).toHaveBeenCalledWith('SBB/test');
    }
  );

  it('should have `localStorage` enabled',
    function () {
      expect(storage.persistent).toEqual(true);
    }
  );


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should set and get a value using `localStorage`',
    function () {
      var obj = {
        test: 'test'
      };

      storage.set('test', obj);
      expect(localStorage.setItem).toHaveBeenCalledWith('SBB/test', JSON.stringify(obj));

      expect(storage.get('test')).toEqual(obj);
      expect(localStorage.getItem).toHaveBeenCalledWith('SBB/test');
    }
  );

  it('should set and get a value using object storage',
    function () {
      var obj = {
        test: 'test'
      };

      storage.set('test', obj, true);
      expect(localStorage.setItem).not.toHaveBeenCalledWith('SBB/test', JSON.stringify(obj));

      expect(storage.get('test')).toEqual(obj);
    }
  );

  it('should have `localStorage` enabled',
    function () {
      expect(storage.persistent).toEqual(true);
    }
  );

});
