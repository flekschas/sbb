describe("about.controller (unit testing)", function() {
  "use strict";

  var AppCtrl,
      appScope,
      AboutCtrl,
      aboutScope,
      $rootScope,
      news;

  beforeEach(function() {
    module('sbb');
    module('sbb.about');

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
        news: news
      });
    });
  });

  it('should exist the AboutCtrl controller',
    function() {
      expect(AboutCtrl).toBeTruthy();
    }
  );

  it('should exist the `mail` function',
    function() {
      expect(typeof(aboutScope.mail)).toEqual('function');
    }
  );

  it('should exist the `setLocation` function',
    function() {
      expect(typeof(aboutScope.setLocation)).toEqual('function');
    }
  );

  it('should be listened to the `scrolled` event',
    function() {
      expect(typeof(aboutScope.scrolled)).toEqual('undefined');

      news.setScrolled('test');
      $rootScope.$digest();

      expect(aboutScope.scrolled).toEqual('test');
    }
  );
});
