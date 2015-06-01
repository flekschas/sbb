angular
  .module('sbb.legals')
  .config(function config ($routeProvider) {
    $routeProvider
      .when('/legals', {
        controller: 'LegalsCtrl',
        controllerAs: 'legals',
        reloadOnSearch: false,
        templateUrl: 'legals/template.html',
        title: 'Legals'
      });
  });
