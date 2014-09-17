angular
  .module( 'sbb' )
  .factory( 'versionService', ['$q', '$http', 'settings',
    function($q, $http, settings) {
      return {
        getVersions: function() {
          var deferred = $q.defer();

          $http
            .get(settings.apiPath + 'versions')
            .success(function (data) {
              deferred.resolve(data);
            })
            .error(function (error) {
              deferred.reject(error);
            });

          return deferred.promise;
        },
        getChangelog: function() {
          var deferred = $q.defer();

          $http
            .get(settings.apiPath + 'changelog')
            .success(function (data) {
              var changelog = {};
              for (var i = data.length; i--;) {
                if (typeof changelog[data[i].version] !== 'undefined'){
                  changelog[data[i].version].push(data[i]);
                } else {
                  changelog[data[i].version] = [data[i]];
                }
              }
              deferred.resolve(changelog);
            })
            .error(function (error) {
              deferred.reject(error);
            });

          return deferred.promise;
        }
      };
    }
  ]);
