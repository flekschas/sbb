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
        news: news,
        initData: $injector.get('homeInitData')
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


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should get and cache search data when input changes',
    inject(function ($injector) {
      var $httpBackend = $injector.get('$httpBackend'),
          keyword = 'kid',
          data = {
            "views": [
              {
                "name": "kidney",
                "score": 0.5,
                "i": 0,
                "sub":  [
                  {
                    "species": "human",
                    "stage": "adult",
                    "link": "human-adult-kidney",
                    "score": 0
                  },
                  {
                    "species": "mouse",
                    "stage": "adult",
                    "link": "mouse-adult-kidney",
                    "score": 0
                  }
                ]
              }
            ],
            "units": [
              {
                "name": "kidney",
                "score": 0.5,
                "i": 0,
                "sub": [
                  {
                    "species": "human",
                    "stage": "adult",
                    "link": "human-adult-male-body",
                    "score": 0,
                    "view": "male body"
                  },
                  {
                    "species": "human",
                    "stage": "adult",
                    "link": "human-adult-female-body",
                    "score": 0,"view": "female body"
                  },
                  {
                    "species": "mouse",
                    "stage": "adult",
                    "link": "mouse-adult-body",
                    "score": 0,"view": "body"
                  }
                ]
              }
            ]
          };

      homeScope.searchInput = keyword;

      $httpBackend
        .expectGET('http://sbb.cellfinder.org/api/1.2.3/s/' + keyword)
        .respond(data);
      $httpBackend.flush();

      homeScope.$digest();

      expect(homeScope.results).toEqual(data);

      // Reset search
      homeScope.searchInput = '';
      homeScope.results = null;

      homeScope.$digest();

      // Search again but this time the results should cause any GET request.
      homeScope.searchInput = keyword;
      homeScope.$digest();

      expect(homeScope.results).toEqual(data);
    })
  );

  it('should show error notification if API is unavailable',
    inject(function ($injector) {
      var $httpBackend = $injector.get('$httpBackend'),
          keyword = 'test',
          notificationData = {
            type: 'error',
            message: 'API is currently unavailable! Please try again later.'
          };

      spyOn($rootScope, '$broadcast').and.callThrough();

      homeScope.searchInput = keyword;

      $httpBackend
        .expectGET('http://sbb.cellfinder.org/api/1.2.3/s/' + keyword)
        .respond(500);
      $httpBackend.flush();

      homeScope.$digest();

      expect(homeScope.searchError).toEqual(true);
      expect($rootScope.$broadcast)
        .toHaveBeenCalledWith('sbbNotification:open', notificationData, undefined);
    })
  );

  it('should watch the `error` parameter and trigger a notification event',
    inject(function ($injector) {
      var $location = $injector.get('$location'),
          errLocation = 'test',
          errData = {
            type: 'error',
            message: 'The page you were looking for (' + errLocation + ') is not available!'
          };

      spyOn($rootScope, '$broadcast').and.callThrough();

      $location.search('error', errLocation);

      $rootScope.$digest();

      expect($rootScope.$broadcast)
        .toHaveBeenCalledWith('sbbNotification:open', errData, undefined);
    })
  );

  it('should change the location when `setLocation` is called',
    inject(function ($injector) {
      var $location = $injector.get('$location'),
          testUrl = 'test';

      spyOn($location, 'url').and.callThrough();

      homeScope.setLocation('test');

      $rootScope.$digest();

      expect($location.url).toHaveBeenCalledWith(testUrl);
    })
  );

  it('should change the location and set a flag when `setHelp` is called',
    inject(function ($injector) {
      var $location = $injector.get('$location'),
          storage = $injector.get('storage');

      spyOn($location, 'url').and.callThrough();

      homeScope.startHelp();

      $rootScope.$digest();

      expect($location.url).toHaveBeenCalledWith('human-adult-male-body?unit=liver');
      expect(storage.get('helpActive')).toEqual(1);
    })
  );
});
