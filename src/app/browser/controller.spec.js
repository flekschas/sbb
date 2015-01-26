describe("browser.controller (unit testing)", function() {
  "use strict";

  /*****************************************************************************
   * Global Variables
   ****************************************************************************/

  var AppCtrl,
      appScope,
      BrowserCtrl,
      browserScope,
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

      browserScope = appScope.$new();

      BrowserCtrl = $controller('BrowserCtrl', {
        $scope: browserScope,
        news: news,
        initData: $injector.get('browserInitData')
      });
    });
  });


  /*****************************************************************************
   * General / Existance Testing
   ****************************************************************************/

  it('should exist the BrowserCtrl controller',
    function () {
      expect(BrowserCtrl).toBeTruthy();
    }
  );

  it('should exist the `closeHelpMessage` function',
    function () {
      expect(typeof(browserScope.closeHelpMessage)).toEqual('function');
    }
  );

  it('should exist the `getGXE` function',
    function () {
      expect(typeof(browserScope.getGXE)).toEqual('function');
    }
  );

  it('should exist the `getOntId` function',
    function () {
      expect(typeof(browserScope.getOntId)).toEqual('function');
    }
  );

  it('should exist the `isMouse` function',
    function () {
      expect(typeof(browserScope.isMouse)).toEqual('function');
    }
  );

  it('should exist the `isUnitOverlayed` function',
    function () {
      expect(typeof(browserScope.isUnitOverlayed)).toEqual('function');
    }
  );

  it('should exist the `isZoomable` function',
    function () {
      expect(typeof(browserScope.isZoomable)).toEqual('function');
    }
  );

  it('should exist the `openHeatmapInfo` function',
    function () {
      expect(typeof(browserScope.openHeatmapInfo)).toEqual('function');
    }
  );

  it('should exist the `picturesAvailable` function',
    function () {
      expect(typeof(browserScope.picturesAvailable)).toEqual('function');
    }
  );

  it('should exist the `prefix` function',
    function () {
      expect(typeof(browserScope.prefix)).toEqual('function');
    }
  );

  it('should exist the `relColor` function',
    function () {
      expect(typeof(browserScope.relColor)).toEqual('function');
    }
  );

  it('should exist the `relExp` function',
    function () {
      expect(typeof(browserScope.relExp)).toEqual('function');
    }
  );

  it('should exist the `resetHeatmap` function',
    function () {
      expect(typeof(browserScope.resetHeatmap)).toEqual('function');
    }
  );

  it('should exist the `selectSingleGene` function',
    function () {
      expect(typeof(browserScope.selectSingleGene)).toEqual('function');
    }
  );

  it('should exist the `setActiveUnit` function',
    function () {
      expect(typeof(browserScope.setActiveUnit)).toEqual('function');
    }
  );

  it('should exist the `setLocation` function',
    function () {
      expect(typeof(browserScope.setLocation)).toEqual('function');
    }
  );

  it('should exist the `setView` function',
    function () {
      expect(typeof(browserScope.setView)).toEqual('function');
    }
  );


  /*****************************************************************************
   * Functional Testing
   ****************************************************************************/

  it('should set app `ready` when `iluReady` is broadcatsed',
    function () {
      $rootScope.$broadcast('iluReady');
      $rootScope.$digest();

      expect(AppCtrl.status).toEqual('ready');
    }
  );

  it('should change the location when `setLocation` is called',
    inject(function ($injector) {
      var $location = $injector.get('$location'),
          testUrl = 'test';

      spyOn($location, 'url').andCallThrough();

      browserScope.setLocation(testUrl);

      $rootScope.$digest();

      expect($location.url).toHaveBeenCalledWith(testUrl);

      browserScope.activeUnit = 'test';
      browserScope.setLocation(testUrl, true);

      expect($location.url).toHaveBeenCalledWith(testUrl + '?unit=' + browserScope.activeUnit);
    })
  );

  it('should set `active unit` and trigger event when `setActiveUnit` is called',
    function () {
      spyOn($rootScope, '$broadcast').andCallThrough();

      browserScope.setActiveUnit('test');

      $rootScope.$digest();

      expect($rootScope.$broadcast).toHaveBeenCalledWith('activeUnit');
      expect(browserScope.activeUnit).toEqual('test');
    }
  );

  it('should broadcast event for opening the dialog containing heat map infos',
    function () {
      var event = 'sbbDialog:open',
          eventData = {
            size: 'large',
            tpl: 'browser/partials/dialogs/heatmap.info.html'
          };

      spyOn($rootScope, '$broadcast').andCallThrough();

      browserScope.openHeatmapInfo();

      $rootScope.$digest();

      expect($rootScope.$broadcast).toHaveBeenCalledWith(event, eventData, undefined);
    }
  );

  it('should compute a mixed colour according to the expression level',
    function () {
      var exp = 60,
          style = {
            'color': '#fff',
            'background-color': '#7f152a'
          };

      browserScope.expression = {
        min: 20,
        max: 100,
        norm: 80
      };

      browserScope.relColor(exp);

      expect(browserScope.relColor(exp)).toEqual(style);
    }
  );

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

      // browserScope.searchInput = keyword;

      // $httpBackend
      //   .expectGET('http://sbb.cellfinder.org/api/1.2.3/s/' + keyword)
      //   .respond(data);
      // $httpBackend.flush();

      // browserScope.$digest();

      // expect(browserScope.results).toEqual(data);

      // // Reset search
      // browserScope.searchInput = '';
      // browserScope.results = null;

      // browserScope.$digest();

      // // Search again but this time the results should cause any GET request.
      // browserScope.searchInput = keyword;
      // browserScope.$digest();

      // expect(browserScope.results).toEqual(data);
    })
  );
});
