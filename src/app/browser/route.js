angular
  .module( 'sbb.browser' )
  .config(function config ( $routeProvider ) {
    $routeProvider
      .when('/:view', {
        controller: 'BrowserCtrl',
        controllerAs: 'browser',
        reloadOnSearch: false,
        resolve: {
            initData: function( browserInitData ){
                return browserInitData();
            }
        },
        templateUrl: 'browser/template.html',
        title: false
      });
  });
