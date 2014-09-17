angular
  .module( 'sbb.browser' )
  .factory( 'initData', ['$q', '$location', 'viewData',
    function($q, $location, viewData) {
      return function () {
        /*
         * Using $location here is only due to a bug when resolving the data
         * via the route. Using a function and transmitting the parameter
         * loads to a `initDataProvider not found` error.
         */
        var data = viewData.getView( $location.path().substr(1) );

        return $q.all([data]).then(function(results) {
          return results[0];
        });
      };
    }
  ]);
