'use strict';

// Controller for handeling the browsing of the illustrations
function ViewCtrl ($scope, $routeParams, $filter, $location, News, $http, settings, SBBStorage, Colors) {
    var fn = {},
        allUnits;

    $http
        .get(settings.apiPath + $routeParams.view)
        .success(function (data) {
            $scope.data = data;

            // Shim for browsers that do not support Object.keys()
            if (typeof Object.keys != 'function') {
                Object.keys = function(obj) {
                   if (typeof obj != "object" && typeof obj != "function" || obj == null) {
                        throw TypeError("Object.keys called on non-object");
                   } 
                   var keys = [];
                   for (var p in obj) obj.hasOwnProperty(p) &&keys.push(p);
                   return keys;
                }
            }
            if (Object.keys(data) && !Object.keys(data).length) {
                $scope.setLocation('/?error=' + $routeParams.view);
                return;
            }

            // Save the gender which is currently viewed
            $scope.gender = $scope.data.view.gender
            if ($scope.gender) {
                SBBStorage.set('gender', $scope.gender, true);
            }

            // Generate full view URI
            $scope.data.view['uri'] = $scope.data.view.ont_id.substr(0, $scope.data.view.ont_id.indexOf('_')).toLowerCase();
            for (var i = $scope.data.prefixes.length - 1; i >= 0; i--) {
                if ($scope.data.prefixes[i].abbr === $scope.data.view['uri']) {
                    $scope.data.view['uri'] = $scope.data.prefixes[i].prefix + $scope.data.view.ont_id;
                }
            };

            // Use custom title or name
            $scope.title = $scope.data.view.title || String($scope.data.view.name).replace(/-/g, ' ');

            // Sort units and rearrange them in a alphabetical array
            $scope.units = {};
            $scope.unit = {};
            for (var i = $scope.data.units.length; i--;) {
                // Check for prefix
                if (~$scope.data.units[i].name.indexOf($scope.data.view.prefix)) {
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
            allUnits = $scope.units; // Save a copy of all units. Needed when resetting after heatmap unit deletion

            // Set img source
            $scope.data.view.imgSrc = $scope.data.view.imgSrc || $scope.data.view.name;

            // Enable heatmap and load hgnc_symbols
            $scope.$watch(function(){
                return $scope.data.expDatasets;
            }, function(newValue, oldValue) {
                if (newValue) {
                    // Set default dataset to hbm
                    $scope.dataset = 'hbm';
                    $scope.geneList = [];
                    $http
                        .get (settings.apiPath + 'genes')
                        .success (function (data) {
                            $scope.geneList = data;
                            $scope.heatmap = true;
                        })
                        .error (function (error) {
                            if (console) console.log('Data for searching could not have been loaded!');
                        });
                }
            });

            $http
                .get(settings.illuPath + $scope.data.view.imgSrc + '.json')
                .success(function (data) {
                    $scope.ilu = data;
                })
                .error(function (error) {
                    $scope.ilu = {
                        'error': {
                            'text': 'Could not load illustration'
                        }
                    };
                });

            // Load similar views for developmental stages
            $http
                .get(settings.apiPath + 'find/' + $scope.data.view.level)
                .success(function (data) {
                    $scope.similarViews = data;
                });

            // Load zoom views too be able to show the "zoom"-path
            $http
                .get(settings.apiPath + 'find/' + $scope.data.view.stage + '/' + $scope.data.view.species)
                .success(function (data) {
                    $scope.zoomViews = data;
                    $scope.zoomInLevels = [];
                    $scope.zoomOutLevels = []

                    var tmp = {};

                    // Rearranges the zoomView object by their levels
                    // Needed for easy traversing the parents
                    var tmp = {},
                        i = data.length;

                    while (i--) {
                        // Check of level already exist
                        // If so check for gender preference or choose randomly
                        if (typeof tmp[data[i].level] === 'undefined') {
                            tmp[data[i].level] = data[i];
                        } else {
                            if (SBBStorage.get('gender', true)) {
                                if (data[i].gender && data[i].gender == SBBStorage.get('gender', true)) {
                                    tmp[data[i].level] = data[i];
                                }
                            } else {
                                if (Math.round(Math.random())) {
                                    tmp[data[i].level] = data[i];
                                }
                            }
                        }

                        // Save views that have a higher resolution than the current view
                        if (data[i].parent === $scope.data.view.level ) {
                            $scope.zoomInLevels.push(data[i]);
                        }
                    }

                    // Start traversing up the zoom hierarchy with the parent of the current view no more parent is given
                    var level = tmp[$scope.data.view.level].parent;
                    while (tmp[level]) {
                        $scope.zoomOutLevels.unshift(tmp[level]);
                        level = tmp[level].parent;
                    }

                    // 'Delete' temporary variables
                    tmp, level = null;
                });
        })
        .error(function (error) {
            $scope.ilu = {
                'error': {
                    'text': 'Could not load illustration'
                }
            };
        });

    // Returns the view specific prefix if hasPrefix is true
    $scope.prefix = function ( hasPrefix ) {
        return hasPrefix ? $scope.data.view.prefix : '';
    };

    // Returns true if a unit is zoomable meaning that a higher resolution of the unit is available
    $scope.isZoomable = function ( unit ) {
        return ( unit && $scope.data.units[$scope.unit[unit]].zoom ) ? true : false;
    }

    // Returns the Ontology ID of a unit
    $scope.getOntId = function ( unit ) {
        try {
            return $scope.data.units[$scope.unit[unit]]['ont_id'];
        } catch(e) {
            return;
        }
    }

    // Returns whether the unit is overlayed 
    $scope.isUnitOverlayed = function (unit) {
        if (unit && $scope.unit[unit] && $scope.data.units[$scope.unit[unit]]) return $scope.data.units[$scope.unit[unit]].overlayed;
        return false;
    };
    
    // Prepare new active unit for broadcasting
    $scope.setActiveUnit = function ( unit, group ) {
        // Replaces the an empty unit with the group if possible
        if (group && typeof $scope.unit[unit] === 'undefined') {
            unit = group;
        }
        News.setActiveUnit(unit); // Invokes the broadcasting of a new active unit
    };

    // Checks whether a view can be loaded and calles the setLocation method
    // Even though the name usually corresponds with the species, developmental stage and view it could be totally arbitrary
    $scope.setView = function ( view ) {
        $http
            .get(settings.apiPath +
                 'find/' +
                 ($scope.data.units[$scope.unit[view]].custom_zoom ? $scope.data.units[$scope.unit[view]].custom_zoom : view) +
                 '/' +
                 $scope.data.view.stage +
                 '/' +
                 $scope.data.view.species)
            .success(function (data) {
                if(data.name) {
                    $scope.setLocation(data.name); // The view was found the the location will be set
                }
            });
    };

    // Wrapper method for changing the location
    $scope.setLocation = function(url, keepActiveUnit) {
        if (keepActiveUnit && $scope.activeUnit) {
            $location.url(url + '?unit=' + $scope.activeUnit);
        } else {
            $location.url(url);
        }
    };

    $scope.relExp = function(unit, gene) {
        return Math.abs(Math.floor($scope.expression[unit][gene] / $scope.expression.max * 10000) / 100) + "%";
    };

    $scope.relColor = function(expression) {
        if (expression && $scope.expression) {
            var percent = (expression - $scope.expression.min) / $scope.expression.norm,
                style = {};

            if (percent < .75) {
                style['background-color'] = Colors.overlay('#004080', '#bf0000', percent / .75);
                style['color'] = '#fff';
            } else  {
                style['background-color'] = Colors.overlay('#bf0000', '#ffd500', (percent - .75) / .25 );
                if (percent < .85) {
                    style['color'] = '#fff';
                } else {
                    style['color'] = '#000';    
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
            $scope.expUnits = true; // Needed for the ngIf directive for the gene expression stacked bar
        } else {
            // Reset units
            $scope.expUnits = false;
            $scope.units = allUnits;
        }
    };
    
    // Listen for when activeUnit is broadcasted
    // Note that activeUnit is only the name of the notification the News service broadcasts
    $scope.$on('activeUnit', function() {
        $scope.activeUnit = News.activeUnit;
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
            News.broadcast('singleGene', undefined);
        }
    });

    // Watch a dataset
    $scope.$watch(function(){
        return $scope.dataset;
    }, function(newValue, oldValue) {
        if (newValue) {
            fn.getExpressions();
        }
    });

    fn.getExpressions = function() {
        if ($scope.genes.length && $scope.dataset) {
            // Serialize selected genes
            var serializedGenes = '';
            var i = $scope.genes.length;
            while (i--) {
                serializedGenes += $scope.genes[i] + '_';
            };
            serializedGenes = serializedGenes.slice(0,-1); // Cut off last '_'

            $http
                .get(settings.apiPath + 'expression/' + $scope.dataset + '/' + serializedGenes)
                .success(function (data) {
                    $scope.expression = data;

                    // Get min and max expression
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
                })
                .error (function (error) {
                    if (console) console.log('Expression data could not been loaded!');
                });
        }
    }

    // Watch for $scope.activeUnit to change 
    $scope.$watch(function() {
        return $scope.activeUnit;
    }, function(newValue, oldValue) {
        // Prevent the location service from firing when Angular initializes
        if(typeof newValue !== 'undefined') {
            $location.search('unit', newValue);
        } else if (typeof oldValue !== 'undefined') {
            $location.search('unit', null);
        }
        // Update localSBBStorage
        SBBStorage.set('activeUnit', newValue);
    });

    // Watch for the $location.search().unit to change
    // $location.search().unit represents the value in the URL like so: http://domain.com/path/?unit=<VALUE>
    $scope.$watch(function() {
        return $location.search().unit;
    }, function(newValue) {
        $scope.setActiveUnit(newValue);
    });

    // Watch for the $location.search().unit to change
    // $location.search().unit represents the value in the URL like so: http://domain.com/path/?unit=<VALUE>
    $scope.$watch(function() {
        return $location.search().genes;
    }, function(newValue, oldValue) {
        if (newValue) {
            if ($scope.genes.join('+') != newValue) {
                $scope.genes = newValue.split('+');
            }
        }
    });

    $scope.$watch('genes', function(newValue) {
        if ($location.search().genes != newValue.join('+')) {
            if (typeof newValue === 'undefined' || newValue.length == 0) {
                $location.search('genes', null);
            } else {
                $location.search('genes', newValue.join('+'));
            }
        }
    },
    true);

    // Watch for the search to change
    // Cache results for more speed
    var results = {};
    $scope.$watch(function() {
        return $scope.searchInput;
    }, function(search) {
        if (typeof search !== 'undefined' && search.length) {
            // Check for cached results
            if (typeof results[search] !== 'undefined') {
                $scope.results = results[search];
            } else {
                $http
                    .get (settings.apiPath + 's/' + search)
                    .success (function (data) {
                        $scope.results = data;
                        // Cache results for later use
                        results[search] = data;
                    })
                    .error (function (error) {
                        if (console) console.log('Data for searching could not have been loaded!');
                    });
            }
        }
    });

    $scope.resetHeatmap = function() {
        $scope.genes = [];
    };

    $scope.openHeatmapInfo = function () {
        $scope.helpMessage = settings.partialsPath + 'heatmap/information.html';
    };

    $scope.selectSingleGene = function (index) {
        if ($scope.selectedGene == index) {
            index = undefined;
        }
        News.broadcast('singleGene', index, $scope.genes[index]);
    };

    $scope.$on('singleGene', function(e, index) {
        $scope.selectedGene = index;
    });

    $scope.$on('activePanel', function () {
        if (News.activePanel == 'heatmap') {
            // Open a message the first time the heatmap is used
            if (SBBStorage.enabled() && !SBBStorage.get('heatmapIntroMessage')) {
                SBBStorage.set('heatmapIntroMessage', 1);
                $scope.helpMessage = settings.partialsPath + 'heatmap/introduction.html';
            }
        }
    });

    // Watch for the help being broadcasted
    $scope.$on('help', function() {
        // Check whether help is activated
        if (News.help) {
            // Check if HTML needs to be set
            if (!SBBStorage.get('helpIntroMessage', true)) {
                SBBStorage.set('helpIntroMessage', true, true);
                $scope.helpMessage = settings.partialsPath + 'help/message.html';
            }
            $scope.helpSearch = settings.partialsPath + 'help/search.html';
            $scope.helpTitle = settings.partialsPath + 'help/title.html';
            $scope.helpIlu = settings.partialsPath + 'help/ilu.html';
            $scope.helpIluAll = settings.partialsPath + 'help/iluAll.html';
            $scope.helpIluBlank = settings.partialsPath + 'help/iluBlank.html';
            $scope.helpLeftNav = settings.partialsPath + 'help/leftNav.html';
            $scope.helpRightNav = settings.partialsPath + 'help/rightNav.html';
            $scope.helpPicture = settings.partialsPath + 'help/picture.html';
            $scope.helpUnits = settings.partialsPath + 'help/units.html';
            $scope.helpInformation = settings.partialsPath + 'help/information.html';
            $scope.helpHeatmap = settings.partialsPath + 'help/heatmap.html';
            $scope.help = true;
            SBBStorage.set('helpActive', 1, true);
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
            SBBStorage.set('helpActive', 0, true);
        }
    });

    $scope.closeHelpMessage = function($event) {
        if ($event) {
            var target = $event.target;
            while (target.tagName.toLowerCase() != 'body') {
                if (target.tagName.toLowerCase() == 'div' && ~target.className.indexOf('content')) return;
                target = target.parentNode;
            }
            $scope.helpMessage = null;
        } else {
            $scope.helpMessage = null;
        }
    }

    $scope.$on('activeUnit', function() {
        $scope.activeUnit = News.activeUnit;
    });

    // Watch for the $location.path() to change
    // Then trigger a page view for piwik
    $scope.$watch(function(){
        return $location.path();
    }, function(newValue, oldValue) {
        if (newValue !== oldValue && typeof(piwikTracker) === 'object') {
            piwikTracker.trackPageView($location.path());
        }
    });

    // Set a current timestamp in days scince 1970
    SBBStorage['lastVisit'] = Math.floor(Date.now() / 86400000);

    // Scope is ready
    $scope.$on('iluReady', function() {
        $scope.ready();
    });
}

// Needed to remain correct dependencies after uglifying
ViewCtrl.$inject = ['$scope', '$routeParams', '$filter', '$location', 'News', '$http', 'settings', 'SBBStorage', 'Colors'];

// Controller for the start and about page
function AboutCtrl ($scope, $location, $window, News, changelog, versions, $http, settings, SBBStorage) {
    $scope.changelog = changelog;
    $scope.versions = versions;
    $scope.currentDate = Date.now();

    // Wrapper method for changing the location
    $scope.setLocation = function(url) {
        $location.url(url);
    };

    // Watch for the $location.path() to change
    // Then trigger a page view for piwik
    $scope.$watch(function(){
        return $location.path();
    }, function(newValue, oldValue) {
        if (newValue !== oldValue && typeof(piwikTracker) === 'object') {
            piwikTracker.trackPageView($location.path());
        }
    });

    // Helper method to hide email in HTML
    $scope.mail = function() {
        $window.location = 'mailto:fritz.lekschas@charite.de?subject=[SBB]';
    }

    // Listen for scroll event
    // Note that activeUnit is only the name of the notification the News service broadcasts
    $scope.$on('scrolled', function() {
        $scope.scrolled = News.scrolled;
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    });

    $scope.$watch('searchInput', function (newValue) {
        if (typeof newValue !== 'undefined' && newValue.length) {
            $http
                .get(settings.apiPath + 's/' + newValue)
                .success(function(data) {
                    $scope.results = data;
                });
        }
    });

    // Watch for errors
    $scope.$watch(function () {
        return $location.search().error
    }, function (newValue, oldValue) {
        if(newValue) {
            $scope.errorHtml = settings.partialsPath + 'error.html';
            $scope.error = true;
            $scope.errorPath = $location.search().error;
        } else if (oldValue) {
            $scope.error = false;
        }
    });
    
    // If visited first time please display introduction information
    // Date return milliseconds. To boil this down to days we have to devide by 1000 (ms->s) * 60 (s->min) * 60 (min->std) * 24 (std->day)
    // If the last visit is 30 days ago then show the message again.
    if (SBBStorage.enabled() && (!SBBStorage.get('lastVisit') || Math.floor(Date.now() / 86400000) - SBBStorage.get('lastVisit') > 30)) {
        $scope.helpHtml = settings.partialsPath + 'help/home.html';
        $scope.help = true;
    }

    $scope.hideError = function() {
        $location.search('error', null);
    };

    $scope.hideHelp = function() {
        $scope.help = false;
    };

    $scope.startHelp = function() {
        SBBStorage.set('helpActive', 1, true);
        $location.url('human-adult-male-body?unit=liver');
    };

    // Set a current timestamp in days scince 1970
    SBBStorage.set('lastVisit', Math.floor(Date.now() / 86400000));

    // Scope is ready
    $scope.ready();
}

// Needed to remain correct dependencies after uglifying
AboutCtrl.$inject = ['$scope', '$location', '$window', 'News', 'changelog', 'versions', '$http', 'settings', 'SBBStorage'];

AboutCtrl.resolve = {
    changelog: ['$q', '$http', 'settings', function($q, $http, settings) {
        var deferred = $q.defer();

        $http
            .get(settings.apiPath + 'changelog')
            .success(function (data) {
                var changelog = {};
                for (var i = data.length; i--;) {
                    if (typeof changelog[data[i].version] !== 'undefined'){
                        changelog[data[i].version].push(data[i]);
                    } else {
                        changelog[data[i].version] = [data[i]];
                    }
                }
                deferred.resolve(changelog);
            })
            .error(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }],
    versions: ['$q', '$http', 'settings', function($q, $http, settings) {
        var deferred = $q.defer();

        $http
            .get(settings.apiPath + 'versions')
            .success(function (data) {
                deferred.resolve(data);
            })
            .error(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }]
}