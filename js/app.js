'use strict';

// Defines the application modul (defines the application as 'sbb')
angular
    .module('sbb', ['ngRoute', 'ngTouch', 'sbb.filters', 'sbb.services', 'sbb.directives'])
    .constant('settings', {
        apiPath: 'http://sbb.cellfinder.org/api/1.1.0/',
        illuPath: './img/ilu/',
        partialsPath: './partials/',
        maxBookmarks: 5
    })
    .config(['$locationProvider', '$routeProvider', '$httpProvider', 'settings', function($locationProvider, $routeProvider, $httpProvider, settings) {
        // Activates HTML5 History API for modern browsers and sets the hashbang for legacy browsers
        $locationProvider.html5Mode(true).hashPrefix('!');

        //Sets the application routers
        $routeProvider
            .when('/', {
                templateUrl: settings.partialsPath + 'home.html',
                controller: AboutCtrl,
                resolve: AboutCtrl.resolve,
                reloadOnSearch: false
            })
            .when('/about', {
                templateUrl: settings.partialsPath + 'about.html',
                controller: AboutCtrl,
                resolve: AboutCtrl.resolve,
                reloadOnSearch: false
            })
            .when('/legals', {
                templateUrl: settings.partialsPath + 'legals.html',
                controller: AboutCtrl,
                resolve: AboutCtrl.resolve,
                reloadOnSearch: false
            })
            .when('/:view', {
                templateUrl: settings.partialsPath + 'view.html',
                controller: ViewCtrl,
                reloadOnSearch: false
            })
            .otherwise({
                redirectTo: '/'
            });

        //Enable cross domain calls
        $httpProvider.defaults.useXDomain = true;

        //Remove the header used to identify ajax call  that would prevent CORS from working
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }])
    .run(['$rootScope', '$anchorScroll', function($rootScope, $anchorScroll) {
        $rootScope.ready = function() {
            $rootScope.status = 'ready';
            $anchorScroll(); // Scroll to an anchor after the page is ready
            if(!$rootScope.$$phase) $rootScope.$apply();
        };

        $rootScope.$on('$routeChangeStart', function() {
            $rootScope.status = 'loading';
            if(!$rootScope.$$phase) $rootScope.$apply();
        });
    }]);
