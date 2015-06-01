angular
  .module('sbb.browser')
  .factory('geneExpressions', ['$q', '$http', 'settings',
    function ($q, $http, settings) {
      return {
        get: function (dataset, genes) {
          var deferred = $q.defer();

          $http
            .get(settings.apiPath +
                 'expression/' +
                 dataset +
                 '/' +
                 genes.join('_'))
            .success(function (data) {
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
