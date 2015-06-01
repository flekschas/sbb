angular
  .module('sbb.home')
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'HomeCtrl',
        controllerAs: 'home',
        reloadOnSearch: false,
        resolve: {
          initData: function (homeInitData) {
            return homeInitData();
          }
        },
        templateUrl: 'home/template.html',
        title: 'Home'
      });
  }]);
