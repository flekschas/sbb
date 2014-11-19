angular
  .module( 'sbb' )
  .factory( 'storage', [
    function () {
      var session = {};
      return {
        set: function (key, value, sessionOnly) {
          try {
            if (sessionOnly) {
              session[key] = value;
            } else {
              localStorage.setItem('SBB/' + key, JSON.stringify(value));
            }
            return true;
          } catch(e) {
            return false;
          }
        },
        get: function (key, sessionOnly) {
          try {
            var value = localStorage.getItem('SBB/' + key);
            if (value === null) {
              return session[key];
            } else {
              return JSON.parse(value);
            }
          } catch(e) {
            return false;
          }
        },
        enabled: function () {
          try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
          } catch(e) {
            return false;
          }
        }
      };
    }
  ]);
