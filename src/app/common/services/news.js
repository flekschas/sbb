angular
  .module( 'sbb' )
  .factory( 'news', [ '$rootScope',
    function($rootScope) {
      var news = {};

      // Sets and broadcasts the active unit
      news.setActiveUnit = function( unit ) {
        this.activeUnit = unit;
        $rootScope.$broadcast('activeUnit');
      };

      // Sets and broadcasts the target of a global click
      news.setClick = function( target ) {
        this.clickTarget = target;
        $rootScope.$broadcast('click');
      };

      // Sets and broadcasts the target of a global click
      news.setScrolled = function( status ) {
        this.scrolled = status;
        $rootScope.$broadcast('scrolled');
      };

      // Sets and broadcasts the height of the accordion
      news.setInfoHeight = function( height ) {
        this.infoHeight = height;
        $rootScope.$broadcast('infoHeight');
      };

      // Sets and broadcasts the help
      news.setHelp = function( help ) {
        this.help = help;
        $rootScope.$broadcast('help');
      };

      // Sets and broadcasts the active panel
      news.setActivePanel = function( panel ) {
        this.activePanel = panel;
        $rootScope.$broadcast('activePanel');
      };

      // Sets and broadcasts the active width
      news.setSliderWidth = function( width ) {
        this.sliderWidth = width;
        $rootScope.$broadcast('sliderWidth');
      };

      news.setTopic = function ( topic ) {
        try {
          news[topic] = {};
          $rootScope.$broadcast('setTopic', topic);
          return true;
        } catch (e) {
          return false;
        }
      };

      news.setTopicData = function ( topic, data ) {
        try {
          news[topic][data.attr] = data.val;
          $rootScope.$broadcast('setTopicData', topic, data);
          return true;
        } catch (e) {
          return false;
        }
      };

      // Generic broadcast function
      news.broadcast = function( event, data, extra) {
        $rootScope.$broadcast( event, data, extra);
      };

      return news;
    }
  ]);
