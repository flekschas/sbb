angular
  .module( 'sbb' )
  .config([
    '$locationProvider',
    '$httpProvider',
    function(
      $locationProvider,
      $httpProvider) {

      // Activates HTML5 History API for modern browsers and sets the hashbang
      // for legacy browsers
      $locationProvider.html5Mode(true).hashPrefix('!');

      //Enable cross domain calls
      $httpProvider.defaults.useXDomain = true;

      //Remove the header used to identify ajax call  that would prevent CORS
      //from working
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
  ]);
