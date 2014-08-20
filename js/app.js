'use strict';

// Defines the application modul (defines the application as 'sbb')
var sbbApp = angular.module('sbb', [
    'ngRoute',
    'ngTouch',
    'sbb.controllers',
    'sbb.filters',
    'sbb.services',
    'sbb.directives'
]);

sbbApp.constant('settings', {
    apiPath: 'http://sbb.cellfinder.org/api/1.2.0/',
    illuPath: './img/ilu/',
    partialsPath: './partials/',
    maxBookmarks: 5
});

sbbApp.config([
    '$locationProvider',
    '$routeProvider',
    '$httpProvider',
    'settings',
    function(
        $locationProvider,
        $routeProvider,
        $httpProvider,
        settings) {

        // Activates HTML5 History API for modern browsers and sets the hashbang
        // for legacy browsers
        $locationProvider.html5Mode(true).hashPrefix('!');

        //Sets the application routers
        $routeProvider
            .when('/', {
                templateUrl: settings.partialsPath + 'home.html',
                controller: 'AboutCtrl',
                resolve: {
                    initData: function(homeInitData){
                        return homeInitData();
                    }
                },
                reloadOnSearch: false,
                title: 'Home'
            })
            .when('/about', {
                templateUrl: settings.partialsPath + 'about.html',
                controller: 'AboutCtrl',
                resolve: {
                    initData: function(aboutInitData){
                        return aboutInitData();
                    }
                },
                reloadOnSearch: false,
                title: 'About'
            })
            .when('/legals', {
                templateUrl: settings.partialsPath + 'legals.html',
                controller: 'LegalsCtrl',
                reloadOnSearch: false,
                title: 'Legals'
            })
            .when('/:view', {
                templateUrl: settings.partialsPath + 'view.html',
                controller: 'ViewCtrl',
                reloadOnSearch: false,
                title: false
            })
            .otherwise({
                redirectTo: '/'
            });

        //Enable cross domain calls
        $httpProvider.defaults.useXDomain = true;

        //Remove the header used to identify ajax call  that would prevent CORS
        //from working
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

sbbApp.run(['$rootScope', '$anchorScroll', '$location', 'isMobile',
    function($rootScope, $anchorScroll, $location, isMobile) {
        $rootScope.ready = function() {
            $rootScope.status = 'ready';
            $anchorScroll(); // Scroll to an anchor after the page is ready
            if(!$rootScope.$$phase) $rootScope.$apply();
        };

        $rootScope.$on('$routeChangeStart', function(event, currentRoute,
                       previousRoute) {
            $rootScope.status = 'loading';
            if(!$rootScope.$$phase) $rootScope.$apply();

            //Change page title, based on Route information
            $rootScope.title = currentRoute.title;

            if (!$rootScope.title) {
                // Create title out of path
                var words = $location.path().substr(1).split('-');
                for (var i = words.length - 1; i >= 0; i--) {
                    words[i] = words[i].charAt(0).toUpperCase() +
                               words[i].slice(1);
                };

                $rootScope.title = words.join(' ');
            }
        });

        $rootScope.isMobile = isMobile.any;
    }
]);
