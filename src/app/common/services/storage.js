angular
  .module('sbb')
  .factory('storage', [
    function () {
      var session = {},
          supportLocalStorage;

      // Test if localStorage is supported
      try {
        localStorage.setItem('SBB/test', 'test');
        localStorage.removeItem('SBB/test');
        supportLocalStorage = true;
      } catch (e) {
        supportLocalStorage = false;
      }

      function set (key, value, sessionOnly) {
          try {
            if (sessionOnly || !supportLocalStorage) {
              session[key] = value;
            } else {
              localStorage.setItem('SBB/' + key, JSON.stringify(value));
            }
            return true;
          } catch (e) {
            return false;
          }
        }

      function get (key, sessionOnly) {
        try {
          var value = localStorage.getItem('SBB/' + key);
          if (value === null) {
            return session[key];
          } else {
            return JSON.parse(value);
          }
        } catch (e) {
          return false;
        }
      }

      return {
        set: set,
        get: get,
        persistent: supportLocalStorage
      };
    }
  ]);
