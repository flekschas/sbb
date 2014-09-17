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
            if (sessionOnly) {
              return session[key];
            } else {
              var value = localStorage.getItem('SBB/' + key);
              return (value && JSON.parse(value));
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
