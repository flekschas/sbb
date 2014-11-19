describe("app.service.storage (unit testing)", function() {
  "use strict";

  var storage,
      $rootScope;

  beforeEach(function() {
    module('sbb');

    inject(function ($injector) {
      storage = $injector.get('storage');
      $rootScope = $injector.get('$rootScope');
    });
  });

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

  it('exists the `enabled` function',
    function () {
      expect(typeof(storage.enabled)).toEqual('function');
    }
  );

  it('should set and get a value',
    function () {
      var obj = {
        test: 'test'
      };

      storage.set('test', obj);

      expect(storage.get('test')).toEqual(obj);
    }
  );

});
