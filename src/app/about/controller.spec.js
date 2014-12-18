describe("about.controller (unit testing)", function() {
  "use strict";

  /*****************************************************************************
   * Global Variables
   ****************************************************************************/

  var AppCtrl,
      appScope,
      AboutCtrl,
      aboutScope,
      $rootScope,
      $window,
      news;


  /*****************************************************************************
   * Global Setting / Setup
   ****************************************************************************/

  beforeEach(function() {
    module('sbb');
    module('sbb.about');
    module( function ($provide) {
      $window = {
        location: {},
        document: window.document
      };
      // We register our new $window instead of the old
      $provide.constant( '$window' , $window );
    });

    inject(function ($injector) {
      var $controller = $injector.get('$controller');

      news = $injector.get('news');
      $rootScope = $injector.get('$rootScope');

      appScope = $rootScope.$new();

      AppCtrl = $controller('AppCtrl as app', {
        $scope: appScope
      });

      aboutScope = appScope.$new();

      AboutCtrl = $controller('AboutCtrl', {
        $scope: aboutScope,
        news: news,
        initData: $injector.get('aboutInitData')
      });
    });
  });


  /*****************************************************************************
   * General / Existance Testing
   ****************************************************************************/

  it('should exist the AboutCtrl controller',
    function() {
      expect(AboutCtrl).toBeTruthy();
    }
  );

  it('should set app in `ready` mode',
    function() {
      $rootScope.$digest();
      expect(AppCtrl.status).toEqual('ready');
    }
  );

  it('should exist the `mail` function',
    function() {
      expect(typeof(aboutScope.mail)).toEqual('function');
    }
  );


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should change the `window` location to trigger mail clients',
    function () {
      aboutScope.mail();
      $rootScope.$digest();

      expect($window.location).toEqual('mailto:fritz.lekschas@charite.de?subject=[SBB]');
    }
  );
});
