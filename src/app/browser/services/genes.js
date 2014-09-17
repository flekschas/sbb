angular
  .module( 'sbb.browser' )
  .factory( 'genes', ['$q', '$http', 'settings',
    function($q, $http, settings) {
      return {
        getAll: function () {
          var deferred = $q.defer();

          $http
            .get (settings.apiPath + 'genes')
            .success (function (data) {
              deferred.resolve(data);
            })
            .error (function (error) {
              deferred.reject(error);
            });

          return deferred.promise;
        }
      };
    }
  ]);
