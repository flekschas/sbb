describe("home.controller (unit testing)", function() {
  "use strict";

  /*****************************************************************************
   * Global Variables
   ****************************************************************************/

  var AppCtrl,
      appScope,
      HomeCtrl,
      homeScope,
      $rootScope,
      news;


  /*****************************************************************************
   * Global Setting / Setup
   ****************************************************************************/

  beforeEach(function() {
    module('sbb');
    module('sbb.home');

    inject(function ($injector) {
      var $controller = $injector.get('$controller');

      news = $injector.get('news');
      $rootScope = $injector.get('$rootScope');

      appScope = $rootScope.$new();

      AppCtrl = $controller('AppCtrl as app', {
        $scope: appScope
      });

      homeScope = appScope.$new();

      HomeCtrl = $controller('HomeCtrl', {
        $scope: homeScope,
        news: news
      });
    });
  });


  /*****************************************************************************
   * General / Existance Testing
   ****************************************************************************/

  it('should exist the HomeCtrl controller',
    function () {
      expect(HomeCtrl).toBeTruthy();
    }
  );

  it('should set app in `ready` mode',
    function () {
      $rootScope.$digest();
      expect(AppCtrl.status).toEqual('ready');
    }
  );

  it('should exist the `setLocation` function',
    function () {
      expect(typeof(homeScope.setLocation)).toEqual('function');
    }
  );

  it('should exist the `startHelp` function',
    function () {
      expect(typeof(homeScope.startHelp)).toEqual('function');
    }
  );

  it('should be listened to the `scrolled` event',
    function () {
      expect(typeof(homeScope.scrolled)).toEqual('undefined');

      news.setScrolled(true);
      $rootScope.$digest();

      expect(homeScope.scrolled).toEqual(true);
    }
  );


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should post search request when input changes',
    inject(function ($injector) {
      var $httpBackend = $injector.get('$httpBackend'),
          keyword = 'test';

      homeScope.searchInput = keyword;

      $httpBackend
        .expectGET('http://sbb.cellfinder.org/api/1.2.3/s/' + keyword)
        .respond(200, '');

      homeScope.$digest();


    })
  );
});
