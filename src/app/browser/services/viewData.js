angular
  .module( 'sbb.browser' )
  .factory( 'viewData', ['$q', '$http', 'settings',
    function($q, $http, settings) {
      return {
        getView: function( view ) {
          var deferred = $q.defer();

          $http
            .get(settings.apiPath + view)
            .success(function (data) {
              deferred.resolve(data);
            })
            .error(function (error) {
              deferred.reject(error);
            });

          return deferred.promise;
        },
        getIllustration: function( imgSrc ) {
          var deferred = $q.defer();

          $http
            .get(settings.illuPath + imgSrc + '.json')
            .success(function (data) {
              deferred.resolve(data);
            })
            .error(function (error) {
              deferred.reject(error);
            });

          return deferred.promise;
        },
        getDevStages: function( level ) {
          var deferred = $q.defer();

          $http
            .get(settings.apiPath + 'find/' + level)
            .success(function (data) {
              deferred.resolve(data);
            })
            .error(function (error) {
              deferred.reject(error);
            });

          return deferred.promise;
        }
      };
    }
  ]);
