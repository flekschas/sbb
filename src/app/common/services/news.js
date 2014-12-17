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

      // Generic broadcast function
      news.broadcast = function( event, data, extra) {
        $rootScope.$broadcast( event, data, extra);
      };

      return news;
    }
  ]);
