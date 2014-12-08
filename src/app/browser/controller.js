angular
  .module( 'sbb.browser' )
  .controller( 'BrowserCtrl', [
    '$scope',
    '$routeParams',
    '$filter',
    '$location',
    '$http',
    'news',
    'settings',
    'storage',
    'colours',
    'initData',
    'viewData',
    'bioSamples',
    'genes',
    'geneExpressions',
    'errors',
    function(
      $scope,
      $routeParams,
      $filter,
      $location,
      $http,
      news,
      settings,
      storage,
      colours,
      initData,
      viewData,
      bioSamples,
      genes,
      geneExpressions,
      errors) {

      var fn = {},
          allUnits;

      $scope.data = initData;

      // Shim for browsers that do not support Object.keys()
      if (typeof Object.keys != 'function') {
        Object.keys = function(obj) {
          if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
            throw new TypeError("Object.keys called on non-object");
          }
          var keys = [];
          for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
              keys.push(p);
            }
          }
          return keys;
        };
      }

      // Wrapper method for changing the location
      $scope.setLocation = function(url, keepActiveUnit) {
        if (keepActiveUnit && $scope.activeUnit) {
          $location.url(url + '?unit=' + $scope.activeUnit);
        } else {
          $location.url(url);
        }
      };

      if (Object.keys($scope.data) && !Object.keys($scope.data).length) {
        $scope.setLocation('/?error=' + $routeParams.view);
        return;
      }

      // Save the gender which is currently viewed
      $scope.gender = $scope.data.view.gender;
      if ($scope.gender) {
        storage.set('gender', $scope.gender, true);
      }

      // Generate full view URI
      $scope.data.view.uri = $scope.data.view.ontId.substr(0, $scope.data.view.ontId.indexOf('_')).toLowerCase();
      for (var i = $scope.data.prefixes.length - 1; i >= 0; i--) {
        if ($scope.data.prefixes[i].abbr === $scope.data.view.uri) {
          $scope.data.view.uri = $scope.data.prefixes[i].prefix + $scope.data.view.ontId;
        }
      }

      // Use custom title or name
      $scope.title = $scope.data.view.title || String($scope.data.view.name).replace(/-/g, ' ');

      // Sort units and rearrange them in a alphabetical array
      $scope.units = {};
      $scope.unit = {};
      for (i = $scope.data.units.length; i--;) {
        // Check for prefix
        if ($scope.data.units[i].name.indexOf($scope.data.view.prefix) >= 0) {
          $scope.data.units[i].prefix = true;
          $scope.data.units[i].title = $scope.data.units[i].title ? $scope.data.units[i].title : $scope.data.units[i].name.substr($scope.data.view.prefix.length + 1).replace(/-/g, ' ');
        } else {
          $scope.data.units[i].title = $scope.data.units[i].title ? $scope.data.units[i].title : $scope.data.units[i].name.replace(/-/g, ' ');
        }

        // Create new sub array
        if (!$scope.units[$scope.data.units[i].title.substr(0,1)]) {
          $scope.units[$scope.data.units[i].title.substr(0,1)] = [];
        }

        $scope.units[$scope.data.units[i].title.substr(0,1)].push($scope.data.units[i]);

        // Save a reference to the index
        $scope.unit[$scope.data.units[i].name] = i;
      }

      // Save a copy of all units. Needed when resetting after heatmap unit
      // deletion
      allUnits = $scope.units;

      // Set img source
      $scope.data.view.imgSrc = $scope.data.view.imgSrc || $scope.data.view.name;

      // Set zoomOutLevel gender
      if ($scope.data.zoomOutLevels.length && $scope.data.view.species === 'human') {
        var gender = storage.get('gender', true);
        if (!gender) {
          if (Math.random() > 0.5) {
            gender = 'male';
          } else {
            gender = 'female';
          }
        }
        $scope.data.zoomOutLevels[0].view = $scope.data.zoomOutLevels[0][gender];
      }

      viewData
        .getIllustration( $scope.data.view.imgSrc )
        .then(
          function success (result) {
            $scope.illustration = result;
          },
          function error () {
            $scope.illustration = {
              'error': {
                'text': 'Could not load illustration'
              }
            };
          }
        );

      viewData
        .getDevStages( $scope.data.view.level )
        .then(function success (result) {
            $scope.similarViews = result;
          }
        );

      // Enable heatmap and load hgnc_symbols
      $scope.$watch(function(){
        return $scope.data.expDatasets;
      }, function(newValue) {
        if (newValue) {
          // Set default dataset to hbm
          $scope.dataset = 'hbm';
          $scope.geneList = [];

          genes.getAll().then(function success (results) {
              $scope.geneList = results;
              $scope.heatmap = true;
          }, function error () {

          });
        }
      });

      // Returns the view specific prefix if hasPrefix is true
      $scope.prefix = function ( hasPrefix ) {
        return hasPrefix ? $scope.data.view.prefix : '';
      };

      // Returns true if a unit is zoomable meaning that a higher resolution of
      // the unit is available
      $scope.isZoomable = function ( unit ) {
        if (unit && $scope.data.units[$scope.unit[unit]].zoom) {
          return true;
        } else {
          return false;
        }
      };

      // Returns the Ontology ID of a unit
      $scope.getOntId = function ( unit ) {
        try {
          return $scope.data.units[$scope.unit[unit]].ont_id;
        } catch(e) {
          return;
        }
      };

      // Returns whether the unit is overlayed
      $scope.isUnitOverlayed = function (unit) {
        if (unit && $scope.unit[unit] && $scope.data.units[$scope.unit[unit]]) {
          return $scope.data.units[$scope.unit[unit]].overlayed;
        }
        return false;
      };

      // Prepare new active unit for broadcasting
      $scope.setActiveUnit = function ( unit, group ) {
        // Replaces the an empty unit with the group if possible
        if (group && typeof $scope.unit[unit] === 'undefined') {
          unit = group;
        }
        news.setActiveUnit(unit); // Invokes the broadcasting of a new active unit
      };

      // Checks whether a view can be loaded and calles the setLocation method
      // Even though the name usually corresponds with the species,
      // developmental stage and view it could be totally arbitrary
      $scope.setView = function ( view ) {
        $http
          .get(settings.apiPath +
              'find/' +
              ($scope.data.units[$scope.unit[view]].custom_zoom ?
               $scope.data.units[$scope.unit[view]].custom_zoom : view) +
              '/' +
              $scope.data.view.stage +
              '/' +
              $scope.data.view.species)
          .success(function (data) {
            if(data.name) {
              // The view was found the thelocation will be set
              $scope.setLocation(data.name);
            }
          });
      };

      $scope.relExp = function(unit, gene) {
        return Math.abs(Math.floor($scope.expression[unit][gene] / $scope.expression.max * 10000) / 100) + "%";
      };

      $scope.relColor = function(expression) {
        if (expression && $scope.expression) {
          var percent = (expression - $scope.expression.min) / $scope.expression.norm,
            style = {};

          if (percent < 0.75) {
            style['background-color'] = colours.overlay('#004080', '#bf0000', percent / 0.75);
            style.color = '#fff';
          } else  {
            style['background-color'] = colours.overlay('#bf0000', '#ffd500', (percent - 0.75) / 0.25 );
            if (percent < 0.85) {
              style.color = '#fff';
            } else {
              style.color = '#000';
            }
          }
          return style;
        }
      };

      fn.expressionUnitSelection = function() {
        if ($scope.expression) {

          var tmp = {},
            firstChar;

          for (var id in $scope.expression.sum) {
            if ($scope.expression.sum.hasOwnProperty(id)) {
              if (typeof $scope.unit[id] !== 'undefined') {
                firstChar = id.substr(0,1);
                // Create new sub array
                if (!tmp[firstChar]) {
                  tmp[firstChar] = [];
                }
                tmp[firstChar].push($scope.data.units[$scope.unit[id]]);
              }
            }
          }

          $scope.units = tmp;
          // Needed for the ngIf directive for the gene expression stacked bar
          $scope.expUnits = true;
        } else {
          // Reset units
          $scope.expUnits = false;
          $scope.units = allUnits;
        }
      };

      // Listen for when activeUnit is broadcasted
      // Note that activeUnit is only the name of the notification the news
      // service broadcasts
      $scope.$on('activeUnit', function() {
        $scope.activeUnit = news.activeUnit;
      });

      $scope.$on('sliderImageOkay', function () {
        $scope.omeroAvailable = true;
      });

      // Watch for a gene selection and load expression data
      $scope.genes = [];
      $scope.$watch(function(){
        return $scope.genes.length;
      }, function(newValue, oldValue) {
        if (newValue) {
          fn.getExpressions();
        } else if (oldValue) {
          $scope.expression = null;
          fn.expressionUnitSelection();
          news.broadcast('singleGene', undefined);
        }
      });

      // Watch a dataset
      $scope.$watch(function(){
        return $scope.dataset;
      }, function(newValue) {
        if (newValue) {
          fn.getExpressions();
        }
      });

      fn.getExpressions = function() {
        if ($scope.genes.length && $scope.dataset) {
          geneExpressions
            .get($scope.dataset, $scope.genes)
            .then(function success (data) {
              $scope.expression = data;

              var min = Number.MAX_VALUE,
                  max = 0;

              for (var id in $scope.expression.sum) {
                if ($scope.expression.sum.hasOwnProperty(id) && $scope.unit[id] > -1) {
                  min = Math.min(min, $scope.expression.sum[id]);
                  max = Math.max(max, $scope.expression.sum[id]);
                }
              }

              $scope.expression.min = min;
              $scope.expression.max = max;
              $scope.expression.norm = max - min;
              fn.expressionUnitSelection();
              news.broadcast('sbbAccordion:open', 'heatmap');
            }, function failure () {
              if (console) {
                console.log('Expression data could not been loaded!');
              }
            });
        }
      };

      // Watch for $scope.activeUnit to change
      $scope.$watch(function() {
        return $scope.activeUnit;
      }, function(newValue, oldValue) {
        // Prevent the location service from firing when Angular initializes
        if(typeof newValue !== 'undefined') {
          $location.search('entity', newValue);
        } else if (typeof oldValue !== 'undefined') {
          $location.search('entity', null);
        }
        // Update localstorage
        storage.set('activeUnit', newValue);
      });

      // Watch for the $location.search().entity to change
      // $location.search().entity represents the value in the URL like so:
      // http://domain.com/path/?entity=<VALUE>
      $scope.$watch(function() {
        return $location.search().entity;
      }, function(newValue) {
        $scope.setActiveUnit(newValue);
      });

      $scope.$watch(function () {
        return $location.search().genes;
      }, function (newValue) {
        if (newValue) {
          if ($scope.genes.join(',') !== newValue) {
            $scope.genes = newValue.split(',');
          }
        }
      });

      $scope.$watch(function () {
        return $scope.genes.length;
      }, function () {
        if ($scope.genes.length) {
          var stringOfGenes = $scope.genes.join(',');
          if ($location.search().genes !== stringOfGenes) {
            $location.search('genes', stringOfGenes);
          }
          setDatasetUrl($scope.dataset);
        } else {
          setDatasetUrl();
          $location.search('genes', null);
        }
      });

      // $scope.$watch(function () {
      //   return $location.search().dataset;
      // }, function (newValue) {
      //   if (newValue.length && $scope.dataset !== newValue) {
      //     $scope.dataset = newValue;
      //   }
      // });

      // $scope.$watch('dataset', function () {
      //   if ($scope.dataset.length && $scope.dataset !== $location.search().dataset) {
      //     $location.search('dataset', $scope.dataset);
      //   } else {
      //     $location.search('dataset', null);
      //   }
      // });

      // Watch for the search to change
      // Cache results for more speed
      var results = {};
      $scope.$watch(function() {
        return $scope.searchInput;
      }, function(search) {
        if (typeof search !== 'undefined' && search.length) {
          $scope.resultsBarType = 'search';
          $scope.showResultsBar = true;
          $scope.resultsLoading = true;

          // Check for cached results
          if (typeof results[search] !== 'undefined') {
            $scope.resultsLoading = false;
            $scope.results = results[search];
          } else {
            $http
              .get (settings.apiPath + 's/' + search)
              .success (function (data) {
                $scope.resultsLoading = false;
                $scope.results = data;
                // Cache results for later use
                results[search] = data;
              })
              .error (function () {
                $scope.resultsLoading = false;
                if (console) {
                  console.log('Data for searching could not have been loaded!');
                }
              });
          }
        } else {
          $scope.showResultsBar = false;
          $scope.resultsLoading = false;
        }
      });

      $scope.resetHeatmap = function() {
        $scope.genes = [];
      };

      $scope.openHeatmapInfo = function () {
        news.broadcast('sbbDialog:open', {
          size: 'large',
          tpl: 'browser/partials/dialogs/heatmap.info.html'
        });
      };

      $scope.selectSingleGene = function (index) {
        if ($scope.selectedGene === index) {
          index = undefined;
        }
        news.broadcast('singleGene', index, $scope.genes[index]);
      };

      $scope.picturesAvailable = function () {
        if ($scope.data && $scope.data.pictures) {
          for (var prop in $scope.data.pictures) {
            if ($scope.data.pictures.hasOwnProperty(prop)) {
              return true;
            }
          }
        }
        return false;
      };

      $scope.$on('singleGene', function(e, index) {
        $scope.selectedGene = index;
      });

      $scope.$on('activePanel', function () {
        if (news.activePanel === 'heatmap') {
          // Open a message the first time the heatmap is used
          if (storage.enabled() && !storage.get('heatmapIntroMessage')) {
            storage.set('heatmapIntroMessage', 1);
            $scope.helpMessage = 'browser/partials/heatmap/introduction.html';
          }
        }
      });

      // Watch for the help being broadcasted
      $scope.$on('help', function() {
        // Check whether help is activated
        if (news.help) {
          news.broadcast('showAll');
          // Check if HTML needs to be set
          if (!storage.get('helpIntroMessage', true)) {
            storage.set('helpIntroMessage', true, true);
            news.broadcast('sbbDialog:open', {
              tpl: 'browser/partials/dialogs/help.intro.html'
            });
          }
          $scope.helpSearch = 'browser/partials/help/search.html';
          $scope.helpTitle = 'browser/partials/help/title.html';
          $scope.helpIlu = 'browser/partials/help/ilu.html';
          $scope.helpIluAll = 'browser/partials/help/iluAll.html';
          $scope.helpIluBlank = 'browser/partials/help/iluBlank.html';
          $scope.helpLeftNav = 'browser/partials/help/leftNav.html';
          $scope.helpRightNav = 'browser/partials/help/rightNav.html';
          $scope.helpPicture = 'browser/partials/help/picture.html';
          $scope.helpUnits = 'browser/partials/help/units.html';
          $scope.helpInformation = 'browser/partials/help/information.html';
          $scope.helpHeatmap = 'browser/partials/help/heatmap.html';
          $scope.help = true;
          storage.set('helpActive', 1, true);
        } else {
          $scope.helpMessage = null;
          $scope.helpSearch = null;
          $scope.helpTitle = null;
          $scope.helpIlu = null;
          $scope.helpIluAll = null;
          $scope.helpIluBlank = null;
          $scope.helpLeftNav = null;
          $scope.helpRightNav = null;
          $scope.helpPicture = null;
          $scope.helpUnits = null;
          $scope.helpInformation = null;
          $scope.helpHeatmap = null;
          $scope.help = false;
          storage.set('helpActive', 0, true);
        }
      });

      $scope.closeHelpMessage = function($event) {
        if ($event) {
          var target = $event.target;
          while (target.tagName.toLowerCase() !== 'body') {
            if (target.tagName.toLowerCase() === 'div' && (target.className.indexOf('content') >= 0)) {
              return;
            }
            target = target.parentNode;
          }
          $scope.helpMessage = null;
        } else {
          $scope.helpMessage = null;
        }
      };

      $scope.$on('activeUnit', function() {
        $scope.activeUnit = news.activeUnit;
      });

      $scope.getGXE = function ( entity ) {
        $scope.resultsBarType = 'bioSamples';
        $scope.showResultsBar = true;
        $scope.resultsLoading = true;
        bioSamples
          .getExp(getEntityUri(entity), getSpeciesUri())
          .then(function ( results ) {
            console.log('getError', results);
            $scope.results = results;
            $scope.results.entity = entity;
            $scope.resultsLoading = false;
          })
          .catch(errors.catch('getGXE', 'Failed to get GXE.'));
      };

      $scope.$on('iluReady', function() {
        $scope.app.ready();
      });

      $scope.isMouse = function () {
        return $scope.data.view.species === "mouse";
      };

      /*
       * Private methods
       */

      function getEntityUri ( entity ) {
        try {
          return $scope.data.units[$scope.unit[entity]].uberon || $scope.data.units[$scope.unit[entity]].ont_id;
        } catch (e) {
          return false;
        }
      }

      function getSpeciesUri () {
        try {
          switch ($scope.data.view.species) {
            case 'human':
              return 'NCBITaxon_9606';
            case 'mouse':
              return 'NCBITaxon_10090';
            default:
              return null;
          }
        } catch (e) {
          return false;
        }
      }

      function setDatasetUrl (dataset) {
        if (typeof dataset !== 'undefined') {
          $location.search('dataset', dataset);
        } else {
          $location.search('dataset', null);
        }
      }
    }
  ]);
