describe('app.service.news (unit testing)', function () {
  'use strict';

  var news,
      $rootScope;

  beforeEach(function () {
    module('sbb');

    inject(function ($injector) {
      news = $injector.get('news');
      $rootScope = $injector.get('$rootScope');
      spyOn($rootScope, '$broadcast');
    });
  });

  /*
   * ---------------------------------------------------------------------------
   * Basic tests
   * ---------------------------------------------------------------------------
   */
  it('exists the news service',
    function () {
      expect(news).not.toEqual(null);
    }
  );

  it('exists the `setActiveUnit` function',
    function () {
      expect(typeof(news.setActiveUnit)).toEqual('function');
    }
  );

  it('exists the `setScrolled` function',
    function () {
      expect(typeof(news.setScrolled)).toEqual('function');
    }
  );

  it('exists the `setInfoHeight` function',
    function () {
      expect(typeof(news.setInfoHeight)).toEqual('function');
    }
  );

  it('exists the `setHelp` function',
    function () {
      expect(typeof(news.setHelp)).toEqual('function');
    }
  );

  it('exists the `setActivePanel` function',
    function () {
      expect(typeof(news.setActivePanel)).toEqual('function');
    }
  );

  it('exists the `broadcast` function',
    function () {
      expect(typeof(news.broadcast)).toEqual('function');
    }
  );

  /*
   * ---------------------------------------------------------------------------
   * Functional tests
   * ---------------------------------------------------------------------------
   */
  it('broadcast and sets the `active unit`',
    function () {
      news.setActiveUnit('test');

      $rootScope.$digest();

      expect($rootScope.$broadcast).toHaveBeenCalledWith('activeUnit');
      expect(news.activeUnit).toEqual('test');
    }
  );

  it('broadcast and sets the scroll status',
    function () {
      news.setScrolled('test');

      $rootScope.$digest();

      expect($rootScope.$broadcast).toHaveBeenCalledWith('scrolled');
      expect(news.scrolled).toEqual('test');
    }
  );

  it('broadcast and sets the height of the info panel',
    function () {
      news.setInfoHeight('test');

      $rootScope.$digest();

      expect($rootScope.$broadcast).toHaveBeenCalledWith('infoHeight');
      expect(news.infoHeight).toEqual('test');
    }
  );

  it('broadcast and set help',
    function () {
      news.setActivePanel('test');

      $rootScope.$digest();

      expect($rootScope.$broadcast).toHaveBeenCalledWith('activePanel');
      expect(news.activePanel).toEqual('test');
    }
  );

  it('broadcast and set active panel',
    function () {
      news.setHelp('test');

      $rootScope.$digest();

      expect($rootScope.$broadcast).toHaveBeenCalledWith('help');
      expect(news.help).toEqual('test');
    }
  );

  it('broadcast generic events and data',
    function () {
      var event = 'test',
          data = {
            test: 'test'
          };

      news.broadcast(event, data);

      $rootScope.$digest();

      expect($rootScope.$broadcast).toHaveBeenCalledWith(event, data, undefined);
    }
  );
});
