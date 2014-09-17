angular
  .module( 'sbb.about' )
  .config(function config( $routeProvider ) {
    $routeProvider
      .when('/about', {
        controller: 'AboutCtrl',
        controllerAs: 'about',
        reloadOnSearch: false,
        resolve: {
            initData: function(aboutInitData){
                return aboutInitData();
            }
        },
        templateUrl: 'about/template.html',
        title: 'About'
      });
  });
