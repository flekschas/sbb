'use strict';

angular
    .module('sbb.directives', [])
    .directive('ngRepeatFinishRender', ['$timeout', 'News', function ($timeout, News) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        News.broadcast('ngRepeatFinished', element);
                    });
                }
            }
        }
    }])
    .directive('globalEvents', ['News', function(News) {
        // Used for global events
        return function(scope, element) {
            // Listens for a mouse click
            // Need to close drop down menus
            element.on('click', function(e) {
                News.setClick(e.target);
            });
        }
    }])
    .directive('scroll', ['News', function(News) {
        return function(scope, element) {
            element.on('scroll', function(e) {
                if (element[0].scrollTop === 0) {
                    News.setScrolled(false);
                } else {
                    if (!News.scrolled) News.setScrolled(true);
                }
            });

            // Init
            News.setScrolled( element[0].scrollTop > 0 );
        }
    }])
    .directive('sbbChosen', ['$compile', '$sce', '$timeout', '$location', 'StringWidth', 'News', 'settings', function($compile, $sce, $timeout, $location, StringWidth, News, settings) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                selection: '=',
                min: '@',
                max: '@'
            },
            templateUrl: settings.partialsPath + 'chosen.html',
            link: function(scope, element, attrs) {
                var fn = {},
                    cachedHits = {},
                    dataLength = 0,
                    limit = parseInt(attrs['limit']),
                    $selection = element.find('ul.selection'),
                    $hits = element.find('ul.hits'),
                    hitsHeight,
                    hitsOffsetTop,
                    hitHeight,
                    bodyFont = $('body').css('font-family'),
                    hitsFontSize = $hits.css('font-size'),
                    hitsFontSizePx = parseInt($hits.css('font-size').slice(0, -2));

                scope.limit = limit;
                scope.hits = [];
                scope.prevNeedle;
                scope.preselection = [{}];
                scope.noResultsText = attrs.noResults;

                scope.$watch('selection', function () {
                    fn.select(scope.selection, true);
                });

                scope.$on('ngRepeatFinished', function(e, el) {
                    // Listen for when the selection ngRepeat finished rendering
                    // Then set the top margin for the ul.hits equal to the ul.selection height
                    if (el.parent().hasClass('selection')) {
                        var outerHeight = $selection.outerHeight(),
                            liHeight = $selection.find('li:first').outerHeight();

                        // Check of outerHeight does not respond to the real height because of min-height 50%
                        if(outerHeight < liHeight) {
                            $hits.css('top', outerHeight + liHeight);
                        } else {
                            $hits.css('top', outerHeight);
                        }
                    }
                    
                    // Set current height of the hits list and update shadow
                    if (el.parent().hasClass('hits')) {
                        hitsHeight = $hits.outerHeight();
                        hitsOffsetTop = $hits.offset().top;
                        fn.checkShadow();
                    }

                });

                // Whatch for source data
                scope.$watch('data', function(newValue, oldValue) {
                    if (newValue && newValue.length) {
                        // Enable chosen
                        dataLength = newValue.length;
                    }
                });

                // Whatch for the selection to be reset
                scope.$watch(function() {
                    return scope.selection.length
                }, function(newValue, oldValue) {
                    if (!newValue && oldValue && scope.preselection.length > 1) {
                        scope.preselection = [{}];
                    }
                });

                scope.placeholder = function (first) {
                    return first ? attrs.placeholder : '';
                };

                scope.focusLatest = function () {
                    $timeout(function(){
                        $selection.find('li:last input')[0].focus();
                    });
                };

                scope.inputKeyUp = function ($event) {
                    var key = $event.keyCode;

                    switch ($event.keyCode) {
                        case 8:
                            // Backspace
                            $event.preventDefault();
                            fn.search($event.target.value);
                            fn.inputWidth($event.target);
                            break;
                        case 9:
                            // Tab
                            fn.select();
                            $event.preventDefault();
                            break;
                        case 13:
                            // Enter
                            fn.select();
                            $event.preventDefault();
                            break;
                        case 38:
                            // Arrow Up
                            $event.preventDefault();
                            fn.checkScrollPos();
                            break;
                        case 40:
                            // Arrow Down
                            $event.preventDefault();
                            fn.checkScrollPos();
                            break;
                        default:
                            fn.search($event.target.value);
                            fn.inputWidth($event.target, true);
                    }
                };

                scope.inputKeyDown = function ($event) {
                    switch ($event.keyCode) {
                        case 8:
                            // Backspace
                            if (!$event.target.value.length) {
                                // Option is already empty so delete previous selection
                                fn.deselect();
                                $event.preventDefault();
                            }
                            break;
                        case 9:
                            // Tab
                            if (scope.hits.length) {
                                fn.select();
                                $event.preventDefault();
                            }
                            break;
                        case 38:
                            // Arrow Up
                            $event.preventDefault();
                            if (scope.selected > 0) --scope.selected;
                            break;
                        case 40:
                            // Arrow Down
                            $event.preventDefault();
                            if (scope.selected < (scope.hits.length - 1)) {
                                if (scope.selected + 2 == scope.limit) {
                                    scope.limit += limit;
                                }
                                ++scope.selected;
                            }
                            break;
                        default:
                            fn.inputWidth($event.target, true);
                    }
                };

                scope.select = function ($event) {
                    fn.select($($event.currentTarget));
                };

                scope.deselect = function ($index) {
                    fn.deselect($index);
                };

                scope.hover = function (index) {
                    scope.selected = index;
                };

                scope.setGeneExample = function (id) {
                    switch (id) {
                        case 'liver':
                            fn.select(['ALB', 'CYP1A2', 'CYP2B6', 'GJB1', 'SERPINA1'], true);
                            break;
                        case 'kidney':
                            fn.select(['CD24', 'GGT1', 'NPHS1', 'NPHS2', 'PAX2'], true);
                            break;
                    }
                };

                scope.noResults = function () {
                    if (!scope.hits.length && $selection.find('li:last input').val().length > 1) return true;
                    else return false;
                };

                scope.noInput = function () {
                    if (!scope.selection.length && !scope.hits.length && $selection.find('li:last input').val().length < 2) return true;
                    else return false;
                };

                scope.selectSingleGene = function (index) {
                    if (scope.selectedGene == index) {
                        index = undefined;
                    }
                    News.broadcast('singleGene', index, scope.selection[index]);
                };

                scope.alreadySelected = function (needle) {
                    return ~scope.selection.indexOf(needle);
                }

                scope.$on('singleGene', function(e, index) {
                    scope.selectedGene = index;
                });

                $hits.on('scroll', function (e) {
                    // Check if we scrolled to the bottom
                    if ((e.currentTarget.scrollTop + 5) >= (e.currentTarget.scrollHeight - e.currentTarget.offsetHeight)) {
                        if (scope.hits.length > scope.limit) {
                            scope.limit += limit;
                        }
                    }
                })

                /*
                 * Private functions
                 */

                fn.search = function (needle) {
                    needle = needle.toUpperCase();
                    var needleLength = needle.length;
                    if (needleLength > 1) {
                        var i,
                            pos,
                            tmp = [];

                        // Set selected option to be the first
                        scope.selected = 0;

                        // Check if hits are cached
                        if (typeof cachedHits[needle] !== 'undefined' && cachedHits[needle].length) {
                            scope.hits = cachedHits[needle];
                            return;
                        }

                        // Check if needle has only been extended
                        // So the previous needle should be a prefix of the current needle
                        if ( needle.indexOf(scope.prevNeedle) === 0 ) {
                            i = scope.hits.length;
                            while (i--) {
                                if ( (pos = scope.hits[i].value.indexOf(needle)) >= 0 ) {
                                    tmp.push({
                                        value: scope.hits[i].value,
                                        with_hit: $sce.trustAsHtml(scope.hits[i].value.substr(0, pos) + '<u>' + scope.hits[i].value.substr(pos, needleLength) + '</u>' + scope.hits[i].value.substr(pos + needleLength))
                                    });
                                }
                            }
                        } else {
                            i = dataLength;
                            while (i--) {
                                if ( (pos = scope.data[i].indexOf(needle)) >= 0 ) {
                                    tmp.push({
                                        value: scope.data[i],
                                        with_hit: $sce.trustAsHtml(scope.data[i].substr(0, pos) + '<u>' + scope.data[i].substr(pos, needleLength) + '</u>' + scope.data[i].substr(pos + needleLength))
                                    });
                                }
                            }
                        }

                        scope.limit = limit; // Reset limit to its original value

                        scope.hits = tmp;
                        scope.prevNeedle = needle;

                        fn.checkShadow();

                        // Cache hits
                        if (typeof cachedHits[needle] === 'undefined') {
                            cachedHits[needle] = tmp;
                        }
                    } else {
                        fn.clear();
                    }
                };

                fn.checkShadow = function (forceRemoval) {
                    if(!forceRemoval && $hits[0].scrollHeight > hitsHeight) {
                        $selection.addClass('shadow');
                    } else {
                        $selection.removeClass('shadow');
                    }
                };

                fn.inputWidth = function (el, offset) {
                    if (el.value.length > 2) {
                        offset = offset ? hitsFontSizePx : 0;
                        $(el).css('width', StringWidth(el.value, hitsFontSize + ' ' + bodyFont) + offset);
                    } else {
                        $(el).css('width', '');
                    }
                };

                fn.select = function (el, valueOnly, k) {
                    var value;

                    if (valueOnly) {
                        value = el;
                    } else {
                        // Search for the selected option or choose the first option of the hits of nothing has been selected
                        if (!el) {
                            var el = element.find('ul.hits li.selected');
                            if (!el.length) {
                                el = element.find('ul.hits li:first');
                            }
                        }

                        if (!el.length) {
                            // Nothing found
                            return;
                        }

                        value = el.data('value');
                    }


                    if (Object.prototype.toString.call( value ) === '[object Array]') {
                        // Multi-select
                        var tmp = [],
                            tmp2 = [],
                            len = value.length;

                        for (var i = 0; i < len; ++i) {
                            // Check if value is already selected
                            if (!~scope.preselection.indexOf(value[i])) {
                                tmp.push({'value': value[i], 'ready': 1});
                            }
                        };
                        tmp.push({});

                        scope.preselection = tmp;
                        scope.selection = value;
                    } else  {
                        // Single-select
                        // Check if value is already selected
                        if (!~scope.selection.indexOf(value)) {
                            scope.selection.push(value);
                        }
                        if (scope.preselection.length != scope.selection) {
                            scope.preselection[scope.preselection.length - 1].value = value;
                            scope.preselection[scope.preselection.length - 1].ready = 1;
                            scope.preselection.push({});
                        }
                    }
                        
                    scope.$on('ngRepeatFinished', function() {
                        // When ngRepeat finished rendering focus the last (new) input
                        scope.focusLatest();
                    });

                    fn.clear();
                };

                fn.deselect = function (index) {
                    if (typeof index === 'number') {
                        scope.preselection.splice(index, 1);
                        scope.selection.splice(index, 1);
                    } else {
                        if (scope.preselection.length < 2) {
                            scope.preselection[0]['value'] = null;
                        } else {
                            scope.preselection.pop();
                            scope.preselection.pop();
                            scope.preselection.push({});
                        }
                        scope.selection.pop();
                    }
                    if (scope.selectedGene > 0 && scope.selectedGene == index) {
                        News.broadcast('singleGene', undefined);
                    }
                };

                fn.clear = function(){
                    scope.hits = [];
                    scope.prevNeedle = null;
                    scope.limit = limit;
                    fn.checkShadow(true);
                };

                fn.checkScrollPos = function() {
                    var el = $hits.find('li.selected'),
                        elHeight = el.outerHeight(),
                        elOffsetTop = el.offset().top;

                    if (elOffsetTop - hitsOffsetTop < 0) {
                        $hits.scrollTop($hits.scrollTop() + elOffsetTop - hitsOffsetTop);
                    }

                    // Scroll down
                    if (elOffsetTop - hitsOffsetTop + elHeight > hitsHeight) {
                        $hits.scrollTop($hits.scrollTop() + elOffsetTop - hitsOffsetTop + elHeight - hitsHeight);
                    }
                };
            }
        }
    }])
    .directive('about', ['$location', 'News', 'settings', function($location, News, settings) {
        // Drop down menu für the logo button
        return {
            restrict: 'C',
            templateUrl: settings.partialsPath + 'app.html',
            scope: true,
            link: function(scope, element) {
                var opened = true;

                // Toggles the visibility of the drop down menu
                scope.toggle = function(state) {
                    opened = (typeof state === 'undefined') ? !opened : state;
                    element.removeClass(opened ? 'closed' : 'opened');
                    element.addClass(opened ? 'opened' : 'closed');
                
                };

                // Listens for the global click event broad-casted by the News service
                scope.$on('click', function() {
                    if (element.find(News.clickTarget.tagName)[0] !== News.clickTarget) {
                        scope.toggle(false);
                    }
                });

                // Init
                scope.toggle();
            }
        }
    }])
    .directive('bookmarks', ['$location', 'News', 'SBBStorage', 'settings', function($location, News, SBBStorage, settings) {
        return {
            restrict: 'C',
            templateUrl: settings.partialsPath + 'bookmarks.html',
            scope: {
                setLocation: '&',
                name: '@',
                displayOnly: '@'
            },
            link: function(scope, element) {
                var opened,
                    bookmarks;

                scope.buttonText = 'Add Bookmark';

                scope.addBookmark = function() {
                    if(!scope.disabled && scope.name) {                     
                        var url = $location.url();

                        bookmarks = SBBStorage.get('bookmarks');
                        bookmarks = bookmarks ? bookmarks.unshift({'name': scope.name,'url': url}) : [{'name': scope.name,'url': url}];
                        bookmarks = bookmarks.splice(0, settings.maxBookmarks);

                        SBBStorage.set('bookmarks', bookmarks);
                        scope.bookmarks = bookmarks;

                        scope.disabled = true;
                        scope.buttonText = 'Bookmark added';
                    }
                };

                // Toggles the visibility of the drop down menu
                scope.toggle = function(state) {
                    if (scope.enabled) {
                        opened = (typeof state === 'undefined') ? !opened : state;
                        element.removeClass(opened ? 'closed' : 'opened');
                        element.addClass(opened ? 'opened' : 'closed');
                    }
                };

                // Listens for the global click event broad-casted by the News service
                scope.$on('click', function() {
                    if (element.find(News.clickTarget.tagName)[0] !== News.clickTarget) {
                        scope.toggle(false);
                    }
                });

                // Watchers
                scope.$watch(function() {
                    return $location.url();
                }, function(newValue){
                    if(newValue && scope.bookmarks) { // '~' bit-wise negation => each 1 turns to 0 because indexOf returns '-1', when nothing is found, which is represented by 1111..111 it will be turned into 0 which is falsy
                        for (var i = scope.bookmarks.length - 1; i >= 0; i--) {
                            if (scope.bookmarks[i].url == newValue) {
                                scope.disabled = true;
                                scope.buttonText = 'Bookmark added';
                            }
                        };
                    } else {
                        scope.disabled = false;
                    }
                });

                scope.$watchCollection('[bookmarks, displayOnly]', function (value) {
                    if ((value[0] && value[0].length) || !value[1]) {
                        scope.enabled = true;
                    } else {
                        scope.enabled = false;
                    }
                });

                // Init
                // scope.toggle();
                scope.bookmarks = SBBStorage.get('bookmarks');
            }
        }
    }])
    .directive('help', ['News', 'SBBStorage', 'settings', function(News, SBBStorage, settings) {
        // Activate the help
        return {
            restrict: 'C',
            templateUrl: settings.partialsPath + 'help.html',
            scope: {},
            link: function(scope, element) {
                var opened = true;

                // Toggles the visibility of the drop down menu
                scope.toggle = function(state, init) {
                    opened = (typeof state === 'undefined') ? !opened : state;
                    element.removeClass(opened ? 'closed' : 'opened');
                    element.addClass(opened ? 'opened' : 'closed');
                    // Broadcast status of help
                    // Ignore for the initialization
                    if (!init) News.setHelp(opened);
                };

                // Init
                scope.toggle(undefined, true);

                // Check if help has been activated somewhere else
                try {
                    if (SBBStorage.get('helpActive', true) == 1) {
                        scope.toggle();
                    }
                } catch(e) {}
            }
        }
    }])
    .directive('species', ['$location', 'News', 'SBBStorage', 'settings', function($location, News, SBBStorage, settings) {
        return {
            restrict: 'C',
            templateUrl: settings.partialsPath + 'species.html',
            scope: {
                setLocation: '&',
                currentSpecies: '@',
                stage: '@',
                similarViews: '='
            },
            link: function(scope, element) {
                var opened = true;

                scope.enabled;

                // Toggles the visibility of the drop down menu
                scope.toggle = function(state, init) {
                    if (scope.enabled || init) {
                        opened = (typeof state === 'undefined') ? !opened : state;
                        element.removeClass(opened ? 'closed' : 'opened');
                        element.addClass(opened ? 'opened' : 'closed');
                    }
                };

                // Look for views of different species with the same developmental stage
                scope.$watch('similarViews', function(value) {
                    if (value) {
                        var count = 0;
                        scope.allSpecies = {};

                        for (var i = value.length; i--;) {
                            if (value[i].stage === scope.stage) {
                                if (typeof scope.allSpecies[value[i].species] !== 'undefined') {
                                    // Check whether we found a prefered gender
                                    // otherwise ignore
                                    if (value[i].gender === SBBStorage.get('gender', true)) {
                                        scope.allSpecies[value[i].species] = value[i];
                                    }
                                } else {
                                    scope.allSpecies[value[i].species] = value[i];
                                }
                                ++count;
                            }
                        }

                        if (count > 1) {
                            scope.enabled = true;
                        }
                    }
                });

                // Listens for the global click event broad-casted by the News service
                scope.$on('click', function(){
                    if (element.find(News.clickTarget.tagName)[0] !== News.clickTarget) {
                        scope.toggle(false);
                    }
                });

                scope.changeSpecies = function (name) {
                    if (name != scope.currentSpecies) {
                        scope.setLocation({url: name, keepActiveUnit: true});
                    }
                };

                // Init
                scope.toggle(undefined, true);
            }
        }
    }])
    .directive('gender', ['SBBStorage', function(SBBStorage) {
        return function($scope) {
            $scope.genderEnabled = false;

            $scope.$watch('gender', function(newValue, oldValue) {
                if (newValue && newValue != oldValue) {
                    if(newValue === 'male') { 
                        $scope.genderIcon = '2';
                        $scope.genderName = 'male';
                    }
                    if(newValue === 'female') {
                        $scope.genderIcon = 'f';
                        $scope.genderName = 'female';
                    }
                }
            });

            // Look for views of different species with the same developmental stage
            $scope.$watch('similarViews', function(value) {
                if (value) {
                    for (var i = value.length; i--;) {
                        if (value[i].stage === $scope.data.view.stage && value[i].species === $scope.data.view.species && value[i].gender !== $scope.gender && value[i].gender !== null) {
                            $scope.genderLink = value[i].name;
                            $scope.genderEnabled = true;
                        }
                    }
                }
            });

            $scope.changeGender = function() {
                $scope.setLocation($scope.genderLink, true);
            }
        }
    }])
    .directive('devStage', ['News', 'settings', function(News, settings) {
        return {
            restrict: 'A',
            templateUrl: settings.partialsPath + 'stage.html',
            scope: {
                setLocation: '&',
                species: '@',
                gender: '@',
                similarViews: '='
            },
            link: function($scope, $element) {
                var open = false;

                // Count number of different developmental stages
                $scope.$watch('similarViews', function(value) {
                    if (value) {
                        $scope.differentStages = [];

                        for (var i = 0; i < value.length; ++i) {
                            var tmp = {};
                            if (value[i].species === $scope.species && (value[i].gender === $scope.gender || (value[i].gender === null && !$scope.gender.length))) {
                                tmp['name'] = value[i].name.replace(/human|mouse/gi, '').replace('-', ' ');
                                tmp['path'] = value[i].name;
                                tmp['stage'] = value[i].stage;
                                $scope.differentStages.push(tmp);
                            }
                        }

                        if ($scope.differentStages.length > 1) {
                            $scope.stageEnabled = true;
                        } else {
                            $scope.stageEnabled = false;
                        }
                    }
                });

                // Listens for the global click event broad-casted by the News service
                $scope.$on('click', function() {
                    var target = News.clickTarget;
                    while (target && target.tagName.toLowerCase() != 'body') {
                        if (target.attributes.getNamedItem('dev-stage')) return;
                        target = target.parentNode;
                    }
                    $scope.toggle(false);
                });
                // Toggles the visibility of the drop down menu
                $scope.toggle = function(state) {
                    if ($scope.stageEnabled) {
                        open = (typeof state === 'undefined') ? !open : state;
                        if (open) {
                            $element.addClass('opened');
                        } else {
                            $element.removeClass('opened');
                        }
                    }
                };
            }
        }
    }])
    .directive('zoom', ['$location', 'News', 'settings', function($location, News, settings) {
        // Drop down menu for changing the resolution, meaning to zoom in or out
        return {
            restrict: 'C',
            templateUrl: settings.partialsPath + 'zoom.html',
            scope: {
                setLocation: '&',
                zoomViews: '=',
                zoomInLevels: '=',
                zoomOutLevels: '=',
                level: '@'
            },
            link: function(scope, element) {
                var opened = true;

                scope.enabled;

                // Toggles the visibility of the drop down menu
                scope.toggle = function(state, init) {
                    if (scope.enabled || init) {
                        opened = (typeof state === 'undefined') ? !opened : state;
                        element.removeClass(opened ? 'closed' : 'opened');
                        element.addClass(opened ? 'opened' : 'closed');
                    }
                };

                // Watches for changes of the zoomInView variable
                scope.$watch(function () {
                    return scope.zoomInLevels
                }, function(value) {
                    // Check whether there are any zoom levels at all
                    if (value) {
                        if (value.length) scope.enabled = 'enabled';
                    }
                });

                // Watches for changes of the zoomOutView variable
                scope.$watch(function () {
                    return scope.zoomOutLevels
                }, function(value) {
                    // Check whether there are any zoom levels at all
                    if (value) {
                        if (value.length) scope.enabled = 'enabled';
                    }
                });

                // Listens for the global click event broad-casted by the News service
                scope.$on('click', function() {
                    if (element.find(News.clickTarget.tagName)[0] !== News.clickTarget) {
                        scope.toggle(false);
                    }
                });

                // Init
                scope.toggle(undefined, true);
            }
        }
    }])
    .directive(
        'raphael',
        ['$http', '$window', 'News', 'Spinner', 'settings', 'ContainEl', 'Colors',
        function($http, $window, News, Spinner, settings, ContainEl, Colors) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: settings.partialsPath + 'raphael.html',
            scope: {
                ilu: '=',
                ontId: '@',
                prefixes: '=',
                setView: '&',
                setActiveUnit: '&',
                isZoomable: '&',
                getOntId: '&',
                expression: '=',
                isUnitOverlayed: '&',
                resetHeatMap: '&',
                view: '='
            },
            link: function($scope, $element, $attrs) {
                var mousedown,
                    x = 0,
                    y = 0,
                    oldX = 0,
                    oldY = 0,
                    mouseStartX,
                    mouseStartY,
                    mouseEndX,
                    mouseEndY,
                    $container = $element,
                    $containerWidth = $element.width(),
                    $containerHeight = $element.height(),
                    $containerOffset = $container.offset(),
                    paper = Raphael($element.attr('id'), $containerWidth, $containerHeight),
                    $svg = $(paper.canvas),
                    vectorElements = [],
                    units = {},
                    groups = {},
                    fn = {},
                    initialScale,
                    defaultScale = 1,
                    currentScale = 1,
                    lastScale,
                    stepZoom = 1,
                    defaultCords = {'x': 0, 'y': 0},
                    center = {'x': 0, 'y': 0},
                    $zoomDialog = $('#zoomDialog'),
                    $heatMapCloseDialog = $('#heatMapCloseDialog'),
                    autoTransformed = false,
                    groupOfGroups = [],
                    colored_units = [],
                    activeExpr,
                    blockCloseClick;

                $scope.heatmap = false;

                $scope.closeHeatMap = function() {
                    $scope.expression = [];
                };

                $scope.$on('singleGene', function(e, index, name) {
                    if (typeof index !== 'undefined') {
                        $scope.selectedGene = name;
                        fn.colorExpression($scope.selectedGene);
                    } else {
                        $scope.selectedGene = undefined;
                        fn.colorExpression();
                    }
                });

                $scope.resetSingleGene = function() {
                    News.broadcast('singleGene', undefined);
                }

                try {
                    var isFileSaverSupported = !!new Blob();
                    $scope.fileSaverSupport = true;
                } catch (e) {
                    $scope.fileSaverSupport = false;
                }

                $scope.download = function () {
                    if ($scope.fileSaverSupport) {
                        try {
                            var output = '<?xml version="1.0" encoding="utf-8"?>' +
                                         '<!-- Downloaded from the Semantic Body Browser (http://sbb.cellfinder.org). For term of usage please refer to http://sbb.cellfinder.org/about#copyright -->' +
                                         '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + jQuery("<p>").append($svg.clone()).html();
                            var blob = new Blob([output], { type: "image/svg+xml;charset=utf-8" });
                            saveAs(blob, $scope.view.name.replace(/-/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) + " (SBB).svg");
                        } catch (e) {}
                    }
                }

                // Show illustration
                fn.show = function() {
                    // Sets default values
                    fn.setDefaults();
                    fn.setSemantics();

                    // Inialize paper
                    paper.setViewBox(
                        defaultCords.x,
                        defaultCords.y,
                        $scope.ilu.viewBox.width,
                        $scope.ilu.viewBox.height, false
                    );

                    // Stop spinner
                    spinner();

                    // Clear the paper
                    paper.clear();

                    // Add title
                    var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                    title.innerHTML = $scope.view.name.replace(/-/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
                    $svg.append(title);

                    // Add copyright
                    var copyright = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
                    if ($scope.view.holdCopyright) {
                        copyright.innerHTML = copyright.innerHTML + 'Copyright (C) Semantic Body Browser. ';
                    }
                    copyright.innerHTML = copyright.innerHTML + 'Licensed under ' + $scope.view.license;
                    $svg.append(copyright);
                    
                    // Add meta information
                    var created = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
                    created.innerHTML = 'Created ' + new Date() + ' at http://sbb.cellfinder.org/' + $scope.view.name + '.';
                    $svg.append(created);

                    // Create vector elements
                    for(var i = 0; i < $scope.ilu.elements.length; ++i) {
                        fn[$scope.ilu.elements[i].type](i, $scope.ilu.elements[i]); // Calls the appropriate function for each element
                    }

                    // Create groups/sets
                    fn.group();

                    // Rerun grouping for groups of groups
                    while (groupOfGroups.length) {
                        fn.reGrouping(groupOfGroups);
                    }

                    fn.adjustStrokeWidth();

                    // Applies the default values
                    $scope.displayAll(true);

                    // Enable CSS rules
                    $scope.ready = true;

                    // Set scope ready
                    News.broadcast('iluReady');
                }

                // Sets the default value for scaling and cetering of the illustration
                fn.setDefaults = function() {
                    // Set default zoom and coordinates
                    var width = ($containerWidth / $scope.ilu.viewBox.width),
                        height = ($containerHeight / $scope.ilu.viewBox.height);
                    
                    center.x = $containerWidth / 2;
                    center.y = $containerHeight / 2;
                        
                    if(width < height) {
                        initialScale = 1 / width;
                        defaultCords.x = 0;
                        defaultCords.y = -($containerHeight - ($scope.ilu.viewBox.height * width)) / (2 * width);
                    } else {
                        initialScale = 1 / height;
                        defaultCords.x = -($containerWidth - ($scope.ilu.viewBox.width * height)) / (2 * height);
                        defaultCords.y = 0;
                    }
                }

                fn.setSemantics = function () {
                    // Set default semantics
                    // Register prefixes
                    var prefix = '';
                    for (var i = $scope.prefixes.length; i--;) {
                        prefix += $scope.prefixes[i]['abbr'] + ': ' + $scope.prefixes[i]['prefix'] + ' ';
                    };
                    paper.canvas.setAttribute('prefix', prefix.substring(0, prefix.length - 1));
                    // Set context URI
                    paper.canvas.setAttribute('about', $scope.ontId.split('_')[0].toLowerCase() + ':' + $scope.ontId);
                };

                fn.adjustStrokeWidth = function () {
                    if (Math.abs(stepZoom - initialScale) > 0.1) {
                        var i = vectorElements.length;
                        while (i--) {
                            if(typeof vectorElements[i].attrs['stroke-width'] !== 'undefined') {
                                vectorElements[i].attr({
                                    'stroke-width': vectorElements[i].attrs['stroke-width'] * (stepZoom / initialScale)
                                });
                            } else {
                                // Remove stroke
                                vectorElements[i].attr({
                                    'stroke': undefined
                                });
                            }
                        }
                        stepZoom = initialScale;
                    }
                };

                // Show error icon
                fn.error = function() {
                    // Stop spinner
                    spinner();

                    // Clear the paper
                    paper.clear();

                    // Draw error icon from RaphaelJS Icons
                    paper
                        .path('M29.225,23.567l-3.778-6.542c-1.139-1.972-3.002-5.2-4.141-7.172l-3.778-6.542c-1.14-1.973-3.003-1.973-4.142,0L9.609,9.853c-1.139,1.972-3.003,5.201-4.142,7.172L1.69,23.567c-1.139,1.974-0.207,3.587,2.071,3.587h23.391C29.432,27.154,30.363,25.541,29.225,23.567zM16.536,24.58h-2.241v-2.151h2.241V24.58zM16.428,20.844h-2.023l-0.201-9.204h2.407L16.428,20.844z')
                        .transform('t' + (($containerWidth / 2) - 15) + ',' + (($containerHeight / 2) - 15))
                        .attr({
                            'fill': '#cc503d',
                            'stroke-width': 0
                        });
                }

                //////////////////////////////////////////////////////////////
                // Watchers
                //////////////////////////////////////////////////////////////

                $scope.$watch('ilu', function(value) {
                    if (value) {
                        if (value.error) {
                            fn.error();
                        } else {
                            fn.show();
                        }
                    }
                });

                // Watch for genes
                $scope.$watch('expression', function(newValue, oldValue) {
                    if (newValue)  {
                        fn.colorExpression();
                    }
                    if (newValue === null && oldValue) {
                        fn.resetExpressionColors();
                    }
                });

                // Watch for changes of the local activeUnit variable and highlight / reset the units appropriately
                $scope.$watch('activeUnit', function(newValue, oldValue) {
                    if(oldValue && oldValue !== newValue) fn.reset(oldValue);
                    if(newValue) {
                        if ($scope.ready) {
                            fn.highlight(newValue);
                            fn.autoZoom(newValue);
                        } else {
                            $scope.$on('iluReady', function () {
                                fn.highlight(newValue);
                                fn.autoZoom(newValue);
                            });
                        }
                    }
                });

                // Listen for when a new active unit is broad-casted and change the local variable appropriately
                $scope.$on('activeUnit', function() {
                    $scope.activeUnit = News.activeUnit;
                });

                // Listens for the global click event broad-casted by the News service
                $scope.$on('click', function() {
                    if ($scope.heatmap) {
                        if ($scope.heatMapCloseDialog && (blockCloseClick - Date.now() < 0)) {
                            if (!ContainEl($heatMapCloseDialog[0], News.clickTarget)) {
                                fn.showHeatMapCloseDialog();
                            }
                        }
                    } else {
                        if (!$element.find(News.clickTarget).length) {
                            if (!$zoomDialog.find(News.clickTarget).length) {
                                fn.showZoomDialog();
                            }
                        }
                    }
                });

                // fn.svg = {
                //  'openSvg' : function(id) {
                //      return '<svg
                //                  version="1.1"
                //                  xmlns="http://www.w3.org/2000/svg"
                //                  ng-attr-id="{{ ' + id + ' }}"
                //                  ng-attr-x="{{ ' + x + ' }}px"
                //                  ng-attr-y="{{ ' + y + ' }}px"
                //                  ng-attr-width="{{ ' + width + ' }}px"
                //                  ng-attr-height="{{ ' + height + ' }}px"
                //                  ng-attr-viewBox="{{ ' + viewBox.x + ' }} {{ ' + viewBox.y + ' }} {{ ' + viewBox.width + ' }} {{ ' + viewBox.height + ' }}">'
                //  },
                //  'closeSvg' : '</svg>',

                // };


                //////////////////////////////////////////////////////////////
                // Raphael functions
                //////////////////////////////////////////////////////////////

                // Method for rendering a rectangle
                fn.rect = function(i, attrs) {
                    vectorElements[i] = paper.rect(attrs.x, attrs.y, attrs.width, attrs.height, attrs.r);
                    fn.setAttrs(i, attrs);
                }

                // Method for rendering a circle
                fn.circle = function(i, attrs) {
                    vectorElements[i] = paper.circle(attrs.x, attrs.y, attrs.r);
                    fn.setAttrs(i, attrs);
                }

                // Method for rendering a ellipse
                fn.ellipse = function(i, attrs) {
                    vectorElements[i] = paper.ellipse(attrs.x, attrs.y, attrs.rx, attrs.ry);
                    fn.setAttrs(i, attrs);
                }

                // Method for rendering a path
                fn.path = function(i, attrs) {
                    vectorElements[i] = paper.path(attrs.d);
                    fn.setAttrs(i, attrs);
                }

                // Method for setting general attributes of elements
                fn.setAttrs = function(i, attrs) {
                    vectorElements[i].attr(attrs);
                    vectorElements[i].node.id = i;
                    if (attrs.id) {
                        units[attrs.id] = i;
                        vectorElements[i].node.setAttribute('data-id', attrs.id);

                        var ontId = $scope.getOntId({'unit': attrs.id});
                        if (ontId) {
                            vectorElements[i].node.setAttribute('property', 'ro:has_part');
                            vectorElements[i].node.setAttribute('resource', ontId.substring(0, ontId.indexOf('_')) + ':' + ontId);
                        }
                    }
                }

                // Method for setting groups
                fn.group = function(g) {
                    var len = $scope.ilu.groups.length,
                        lastK;
                    for (var i = 0; i < len; ++i) {
                        var id = $scope.ilu.groups[i].id;

                        // Add group elements to units
                        if (units[id]) {
                            lastK = units[id].length;
                            units[id] = units[id].concat($scope.ilu.groups[i].elements);
                        } else {
                            units[id] = $scope.ilu.groups[i].elements;
                        }
                        // Add <g> element for semantic purpose
                        if (groups[id]) {
                            groups[id].push(paper.group());
                        } else {
                            groups[id] = [paper.group()];
                        }
                        var lastGroup = groups[id].length - 1;
                        // RDFA
                        if (id) {
                            var ontId = $scope.getOntId({'unit': id});
                            if (ontId) {
                                for (var j = groups[id].length - 1; j >= 0; j--) {
                                    groups[id][j].node.setAttribute('property', 'ro:has_part');
                                    groups[id][j].node.setAttribute('resource', ontId.substring(0, ontId.indexOf('_')) + ':' + ontId);
                                };
                            }
                        }
                        // Needed such that the DOM element is only moved once
                        var move = true;
                        for(var k = $scope.ilu.groups[i].elements.length - 1; k >= lastGroup; --k) {
                            if (typeof $scope.ilu.groups[i].elements[k] === 'number') {
                                // Move DOM element of the group once
                                if (move) {
                                    move = false;
                                    vectorElements[$scope.ilu.groups[i].elements[k]].node.parentNode.insertBefore(groups[id][lastGroup].node, vectorElements[$scope.ilu.groups[i].elements[k]].node.nextSibling);
                                }
                                // Only add attribute when the element is no group
                                // This case: annonymous path
                                vectorElements[$scope.ilu.groups[i].elements[k]].node.setAttribute('data-group', id);
                                groups[id][lastGroup].push(vectorElements[$scope.ilu.groups[i].elements[k]]);
                            } else if (typeof units[$scope.ilu.groups[i].elements[k]] === 'number') {
                                // Move DOM element of the group once
                                if (move) {
                                    move = false;
                                    vectorElements[units[$scope.ilu.groups[i].elements[k]]].node.parentNode.insertBefore(groups[id][lastGroup].node, vectorElements[units[$scope.ilu.groups[i].elements[k]]].node.nextSibling);
                                }
                                // This case: annotate path
                                vectorElements[units[$scope.ilu.groups[i].elements[k]]].node.setAttribute('data-group', id);
                                groups[id][lastGroup].push(vectorElements[units[$scope.ilu.groups[i].elements[k]]]);
                            } else {
                                // Some of the group may not have been created right now so save these for a later checkup
                                groupOfGroups.push({
                                    parent: id,
                                    id: lastGroup,
                                    child: $scope.ilu.groups[i].elements[k]
                                });
                            }
                        }
                    }
                }

                // Re-group groups of groups
                fn.reGrouping = function(groupOfGroups) {
                    var group = groupOfGroups.pop();

                    groups[group.child][0].node.setAttribute('data-group', group.parent);

                    // Move 
                    try {
                        $(groups[group.child][0].node).appendTo(groups[group.parent][group.id].node);
                    } catch(e) {
                        if (console) console.log(e);
                    }
                }

                //////////////////////////////////////////////////////////////
                // Illustration manipulation
                //////////////////////////////////////////////////////////////

                // Applies the default values for the scaling and positioning of the illustration
                $scope.displayAll = function (notSmooth) {
                    currentScale = defaultScale;
                    x = 0;
                    y = 0;

                    fn.transform(currentScale, x, y, !notSmooth);
                };

                // linear interpolation between two values a and b
                // u controls amount of a/b and is in range [0.0,1.0]
                fn.lerp = function (a,b,u) {
                    return (1-u) * a + u * b;
                };

                /* accepts parameters
                 * h  Object = {h:x, s:y, v:z}
                 * OR 
                 * h, s, v
                 * H, s and v must be [0, 1.0]
                 */
                fn.hsvToHex = function (h, s, v) {
                    var r, g, b, i, f, p, q, t;
                    if (h && s === undefined && v === undefined) {
                        s = h.s, v = h.v, h = h.h;
                    }
                    i = Math.floor(h * 6);
                    f = h * 6 - i;
                    p = v * (1 - s);
                    q = v * (1 - f * s);
                    t = v * (1 - (1 - f) * s);
                    switch (i % 6) {
                        case 0: r = v, g = t, b = p; break;
                        case 1: r = q, g = v, b = p; break;
                        case 2: r = p, g = v, b = t; break;
                        case 3: r = p, g = q, b = v; break;
                        case 4: r = t, g = p, b = v; break;
                        case 5: r = v, g = p, b = q; break;
                    }

                    return '#' + ((1 << 24) + (((r * 255) >> 0) << 16) + (((g * 255) >> 0) << 8) + ((b * 255) >> 0)).toString(16).slice(1);
                }

                // Color expression
                fn.colorExpression = function ( gene ) {
                    var color,
                        tmpMax = 0,
                        tmpMin = Number.MAX_VALUE,
                        tmpNorm,
                        oldColoredUnits = colored_units;

                    // Set heatmap to true
                    $scope.heatmap = true;

                    // Reset active unit and close dialog
                    fn.showZoomDialog();
                    $scope.setActiveUnit({unit:undefined, group:undefined});

                    fn.fadeOutElements();
                    colored_units = [];

                    // Color units
                    if (gene) {
                        for (var id in $scope.expression.sum) {
                            if ($scope.expression.sum.hasOwnProperty(id) && units[id]) {
                                if ($scope.expression[id][gene] < tmpMin) {
                                    tmpMin = $scope.expression[id][gene];
                                }
                                if ($scope.expression[id][gene] > tmpMax) {
                                    tmpMax = $scope.expression[id][gene];
                                }
                            }
                        }
                        tmpNorm = (tmpMax - tmpMin);
                    } else {
                        gene = 'sum';
                    }

                    for (var id in $scope.expression.sum) {
                        if ($scope.expression.sum.hasOwnProperty(id) && units[id]) {
                            if ($scope.expression.norm == 0 || tmpNorm == 0) {
                                fn.reset(id);
                            } else {

                                colored_units.push(id);

                                var percent,
                                    color,
                                    textColor;

                                if (gene == 'sum') {
                                    percent = ($scope.expression.sum[id] - $scope.expression.min) / $scope.expression.norm;
                                } else {
                                    percent = ($scope.expression[id][gene] - tmpMin) / tmpNorm;
                                }

                                /* 
                                 * Fade between 0% - 75% - 100%
                                 * 0%   #004080
                                 * 75%  #bf0000
                                 * 100% #ffd500
                                 */
                                if (percent < .75) {
                                    color = Colors.overlay('#004080', '#bf0000', percent / .75);
                                } else  {
                                    color = Colors.overlay('#bf0000', '#ffd500', (percent - .75) / .25 );
                                }

                                fn.highlight(id, color);
                            }
                        }
                    }
                    // Reset colored units that are not available in the new expression data
                    for (var i in oldColoredUnits) {
                        if (!~colored_units.indexOf(oldColoredUnits[i])) {
                            fn.reset(oldColoredUnits[i]);
                        }
                    };
                }

                // Reset expression colors
                fn.resetExpressionColors = function () {
                    $scope.heatmap = false;
                    fn.showHeatMapCloseDialog();

                    // Reset highlighted units
                    for (var i = colored_units.length; i >= 0; --i) {
                        fn.reset(colored_units[i]);
                    }

                    // Reset opacity of all elements
                    var i = vectorElements.length
                    while (--i) {
                        vectorElements[i].node.setAttribute('class', '');
                    }
                };

                // Lower opacity of all elements
                fn.fadeOutElements = function () {
                    var i = vectorElements.length
                    while (--i) {
                        vectorElements[i].node.setAttribute('class', 'bg');
                    }
                };

                // Lower opacity of all elements
                fn.fadeInElements = function () {
                    var i = vectorElements.length
                    while (--i) {
                        vectorElements[i].node.setAttribute('class', '');
                    }
                };

                // Prepares dragging of the illustration
                fn.mousedown = function(e) {
                    mousedown = true;
                    mouseStartX = e.pageX || e.gesture.srcEvent.pageX;
                    mouseStartY = e.pageY || e.gesture.srcEvent.pageY;

                    // Reset last mouse end position
                    mouseEndX = mouseEndY = undefined;
                };

                // Updates the position of the illustration 
                fn.mousemove = function(e) {
                    if (mousedown) {

                        mouseEndX = -1 * (((mouseStartX - (e.pageX || e.gesture.srcEvent.pageX)) / currentScale) - x);
                        mouseEndY = -1 * (((mouseStartY - (e.pageY || e.gesture.srcEvent.pageY)) / currentScale) - y);

                    
                        fn.transform(currentScale, mouseEndX, mouseEndY);

                        fn.showZoomDialog();
                        fn.showHeatMapCloseDialog();

                        autoTransformed = false;
                    }
                };

                // Updates the x and y coordinates of the next dragging and zooming
                fn.mouseup = function(e) {
                    if ( mousedown && (typeof mouseEndX !== "undefined") && (typeof mouseEndY !== "undefined") ) {
                        x = mouseEndX;
                        y = mouseEndY;
                    }
                    mousedown = false;
                };

                // Highlights interactive units as they are hovered by the mouse cursor
                fn.mouseover = function(e) {
                    var id = e.target.id,
                        unit = e.target.getAttribute("data-id"),
                        group = e.target.getAttribute("data-group");

                    if ((unit || group) && !$scope.heatmap && fn.isNotActive( e.target )) {
                        // #f2d291 is a yellow-ish color
                        vectorElements[id].attr({
                            fill: Colors.overlay($scope.ilu.elements[id].fill, '#f2d291', .66),
                            stroke: Colors.overlay($scope.ilu.elements[id].stroke, '#f2d291', .5)
                        });
                    }
                };

                // Resets the original colors of the unit when the mouse cursor leaves
                fn.mouseout = function(e) {
                    var id = e.target.id,
                        unit = e.target.getAttribute("data-id"),
                        group = e.target.getAttribute("data-group");

                    if ((unit || group) && !$scope.heatmap && fn.isNotActive( e.target )) {
                        vectorElements[id].attr({
                            fill: $scope.ilu.elements[id].fill,
                            stroke: $scope.ilu.elements[id].stroke
                        });
                    }
                };

                /* Active only when: 
                 *  1. Unit is not the active unit AND
                 *  2. Unit has no group OR
                 *  3. Unit has a group which is not part of the active unit
                 */
                fn.isNotActive = function( el ) {
                    if (!$scope.activeUnit) return true;

                    var unit = el.getAttribute("data-id"),
                        group = el.getAttribute("data-group"),
                        parent = el.parentNode;

                    if (unit == $scope.activeUnit) return false;

                    while (parent.tagName === 'g' && parent.getAttribute('data-group') && group != $scope.activeUnit) {
                        group = parent.getAttribute('data-group');
                        parent = parent.parentNode;
                    }

                    if (group == $scope.activeUnit) return false;

                    return true;
                }

                // Sets a new active unit when a click on it is performed
                fn.click = function(target) {
                    if(!$scope.heatmap && (target.getAttribute("data-id") || target.getAttribute("data-group"))) {
                        $scope.setActiveUnit({unit: target.getAttribute("data-id"), group: target.getAttribute("data-group")});
                        $scope.$apply(); // Lets AngularJS digest changes (need if an external library does changes)
                    }
                };

                // Open dialog if a double lick is performed on an interactive unit
                fn.dblclick = function(target, x, y) {
                    if(!$scope.heatmap && target && (target.getAttribute('data-id') || target.getAttribute('data-group'))) {
                        fn.showZoomDialog(x, y);
                    } else {
                        if ($scope.heatmap && !$scope.activeUnit) {
                            fn.showHeatMapCloseDialog(x, y);
                        }
                        fn.showZoomDialog(); // Closes dialog
                        $scope.setActiveUnit({unit:undefined, group:undefined}); // Resets the active unit
                        $scope.$apply(); // Let AngularJS digest changes (need if an external library does changes)
                    }
                }

                // fn.checkUnitDim = function () {
                //  var el;

                //  // Get g element
                //  if (target.getAttribute("data-group")) {
                //      el = target.parentNode;
                //      while (el.tagName != 'g' && el.tagName != 'svg') {
                //          el = el.parentNode;
                //      }
                //  } else {
                //      el = target;
                //  }

                //  var dim     = el.getBBox(),
                //      centerX = (dim.x + dim.width / 2 + defaultCords.x) / initialScale,
                //      centerY = (dim.y + dim.height / 2 + defaultCords.y) / initialScale;

                //  // If one dimension is smaller than 4% of the container and the other dimension is at least smaller than 10% of the container
                //  if (dim.width * currentScale  / initialScale / $containerWidth < 0.04) {
                //      if (dim.height * currentScale  / initialScale / $containerHeight < 0.1) fn.autoZoom(centerX, centerY);
                //  } else if (dim.height * currentScale  / initialScale / $containerHeight < 0.04) {
                //      if (dim.width * currentScale  / initialScale / $containerWidth < 0.1) fn.autoZoom(centerX, centerY);
                //  }
                // };

                // Opens a dialog which displays the unit's / group's definition and gives the possibility to open CellFinder or to zoom in
                // No parameter == closing
                fn.showZoomDialog = function( x, y ) {
                    if (x && y) {
                        // Reset older unit Definition to avoid misunderstanding if loading takes a second or two
                        $scope.unitDefinition = undefined;

                        // Define drop down direction
                        $zoomDialog.removeClass('left').removeClass('right').removeClass('top');
                        if ( $containerWidth - x < 200) {
                            $zoomDialog.addClass('left');
                        }
                        if ( x < 200) {
                            $zoomDialog.addClass('right');
                        }
                        // We have to substract the header height from the y value
                        if ( (y - 41) / $containerHeight > 0.5) {
                            $zoomDialog.addClass('top');
                        }

                        // Check if active unit is zoomable
                        $scope.zoomDisabled = !$scope.isZoomable({ unit: $scope.activeUnit });
                        $scope.ontId = $scope.getOntId({ unit: $scope.activeUnit });
                        if ($scope.ontId) {
                            $http
                                .get( settings.apiPath + 'definitions/' + $scope.ontId)
                                .success(function (data) {
                                    $scope.unitDefinition = data[0];
                                });
                        }
                        $scope.$apply();

                        // Set drop container coordinates
                        $zoomDialog.css('top', (y - $containerOffset.top) + 'px' ).css('left', x + 'px' ).addClass('opened');
                    } else {
                        // Close dialog
                        $zoomDialog.removeClass('opened');
                    }
                };

                fn.showHeatMapCloseDialog = function( x, y ) {
                    if (x && y) {
                        // Define drop down direction
                        $heatMapCloseDialog.removeClass('left').removeClass('right').removeClass('top');
                        if ( $containerWidth - x < 130) {
                            $heatMapCloseDialog.addClass('left');
                        }
                        if ( x < 130) {
                            $heatMapCloseDialog.addClass('right');
                        }
                        // We have to substract the header height from the y value
                        if ( (y - 41) / $containerHeight > 0.5) {
                            $heatMapCloseDialog.addClass('top');
                        }

                        $heatMapCloseDialog.css('top', (y - $containerOffset.top) + 'px' ).css('left', x + 'px' );
                        $scope.heatMapCloseDialog = true;
                        // Blocking the closing within the next 30 Milliseconds.
                        blockCloseClick = Date.now() + 30;
                    } else {
                        if ($scope.heatMapCloseDialog) {
                            $scope.heatMapCloseDialog = false;
                            $scope.$apply();
                        }
                    }
                };

                // Highlights a unit / set of units permanently
                fn.highlight = function(id, color, fade) {
                    if (typeof color === 'undefined') {
                        color = '#ff8a59'; // #ff8a59 = orange-ish color
                    }

                    if(!$scope.ilu) {
                        // If the illustration is not set yet than the highlight method will wait till it is and call itself again
                        $scope.$watch('ilu', function(value){
                            if(value) {
                                fn.highlight(id, color, fade);
                            }
                        });
                    } else {
                        if(typeof units[id] !== 'undefined') {
                            if (Object.prototype.toString.call( units[id] ) === '[object Array]') {
                                if ((fade || ($scope.activeUnit && $scope.isUnitOverlayed({unit: $scope.activeUnit}))) && !$scope.heatmap) {
                                    fn.fadeOutElements();
                                }
                                // a set of units is highlighted
                                var i = units[id].length;
                                while(i--) {
                                    if (typeof units[id][i] === 'number') {
                                        if (typeof $scope.ilu.elements[units[id][i]].stroke === 'undefined' && $scope.ilu.elements[units[id][i]].fill === 'none') {
                                            // Unit currently has no color
                                            if ($scope.heatmap && color == '#ff8a59') {
                                                vectorElements[units[id][i]].node.setAttribute('class', 'pulsate');
                                            } else {
                                                vectorElements[units[id][i]].node.setAttribute('class', '');
                                                vectorElements[units[id][i]].attr({
                                                    fill: color,
                                                    stroke: color
                                                });
                                            }
                                        } else {
                                            // Unit has color
                                            if ($scope.heatmap && color == '#ff8a59') {
                                                vectorElements[units[id][i]].node.setAttribute('class', 'pulsate');
                                            } else {      
                                                vectorElements[units[id][i]].node.setAttribute('class', '');
                                                vectorElements[units[id][i]].attr({
                                                    fill: Colors.overlay($scope.ilu.elements[units[id][i]].fill, color, .85),
                                                    stroke: Colors.overlay($scope.ilu.elements[units[id][i]].stroke, color, .75)
                                                });
                                            }
                                        }
                                    } else {
                                        // Recursively calls itself if a subgroup, e.g. a group in a group, is found
                                        fn.highlight(units[id][i], color);
                                    }
                                }
                            }
                            else if (typeof units[id] === 'number') {
                                if ((fade || ($scope.activeUnit && $scope.isUnitOverlayed({unit: $scope.activeUnit}))) && !$scope.heatmap) {
                                    fn.fadeOutElements();
                                }
                                // a single unit is highlighted
                                if (typeof $scope.ilu.elements[units[id]].stroke === 'undefined' && $scope.ilu.elements[units[id]].fill === 'none') {
                                    // Unit currently has no color
                                    if ($scope.heatmap && color == '#ff8a59') {
                                        vectorElements[units[id]].node.setAttribute('class', 'pulsate');
                                    } else {     
                                        vectorElements[units[id]].node.setAttribute('class', '');  
                                        vectorElements[units[id]].attr({
                                            fill: color,
                                            stroke: color
                                        });
                                    }
                                } else {
                                    // Unit has color
                                    if ($scope.heatmap && color == '#ff8a59') {
                                        vectorElements[units[id]].node.setAttribute('class', 'pulsate');
                                    } else { 
                                        vectorElements[units[id]].node.setAttribute('class', '');      
                                        vectorElements[units[id]].attr({
                                            fill: Colors.overlay($scope.ilu.elements[units[id]].fill, color, .85),
                                            stroke: Colors.overlay($scope.ilu.elements[units[id]].stroke, color, .75)
                                        });
                                    }
                                }
                            }
                        } else {
                            if (console) console.log('Oh hell no! I can\'t find the ' + id);
                        }
                    }
                };

                // Reset the original colors
                fn.reset = function(id) {
                    if(!$scope.ilu) {
                        // If the illustration is not set yet than the highlight method will wait till it is and call itself again
                        $scope.$watch('ilu', function(value){
                            if(value) {
                                fn.reset(id);
                            }
                        });
                    } else {
                        if(typeof units[id] !== 'undefined') {
                            if (Object.prototype.toString.call( units[id] ) === '[object Array]') {
                                if (!$scope.heatmap) {
                                    fn.fadeInElements();
                                }
                                var i = units[id].length;
                                // a set of units is reset
                                while(i--) {
                                    if (typeof units[id][i] === 'number') {
                                        if ($scope.heatmap && ~colored_units.indexOf(id)) {
                                            vectorElements[units[id][i]].node.setAttribute('class', '');
                                        } else {
                                            vectorElements[units[id][i]].attr({
                                                fill: $scope.ilu.elements[units[id][i]].fill,
                                                stroke: $scope.ilu.elements[units[id][i]].stroke
                                            });
                                        }
                                    } else {
                                        // Recursively calls itself if a subgroup, e.g. a group in a group, is found
                                        fn.reset(units[id][i]);
                                    }
                                }
                            }
                            else if (typeof units[id] === 'number') {
                                // a single unit is reset
                                if (!$scope.heatmap) {
                                    fn.fadeInElements();
                                    vectorElements[units[id]].attr({
                                        fill: $scope.ilu.elements[units[id]].fill,
                                        stroke: $scope.ilu.elements[units[id]].stroke
                                    });
                                } else {
                                    if (~colored_units.indexOf(id)) {
                                        vectorElements[units[id][i]].node.setAttribute('class', '');
                                    } else {
                                        vectorElements[units[id]].attr({
                                            fill: $scope.ilu.elements[units[id]].fill,
                                            stroke: $scope.ilu.elements[units[id]].stroke
                                        });
                                    }
                                }
                            }
                        }
                    }
                };

                // Resizes the drawing canvas
                fn.resizePaper = function() {
                    var width = $element.width(),
                        height = $element.height();

                    if ((width && $containerWidth != width) || (height && $containerHeight != height)) {
                        $containerWidth = width;
                        $containerHeight = height;

                        center.x = $containerWidth / 2;
                        center.y = $containerHeight / 2;

                        fn.setDefaults(); // Recalculate default positioning and scaling

                        // Apply new default values
                        paper.setSize($containerWidth, $containerHeight);
                        paper.setViewBox(defaultCords.x, defaultCords.y, $scope.ilu.viewBox.width, $scope.ilu.viewBox.height, false);

                        fn.adjustStrokeWidth();
                    }
                };

                // d (delta): Number of times the mouse-wheel has been turned. Vales < 0 means scrolling down the page == zoom in
                fn.mousewheel = function(e, d) {
                    var mousewheelZoomFactor = 0.02;

                    if (~navigator.userAgent.indexOf('Firefox') || ~navigator.userAgent.indexOf('MSIE')) {
                        mousewheelZoomFactor *= 2;
                    }

                    fn.zoom(1 + (mousewheelZoomFactor * d));

                    autoTransformed = false;
                }

                // // Processes the pinch gesture
                // fn.transform = function(e) {
                //  var touchZoomFactor = 0.02,
                //      scale,
                //      posX = e.position.x - center.x,
                //      posY = e.position.y - $containerOffset.top - center.y;

                //  if (e.scale < 1) { // zoom out
                //      scale = 1 + (1 / e.scale) * touchZoomFactor;
                //  } else { // zoom in
                //      scale = 1 + (e.scale) * touchZoomFactor * -1;
                //  }

                //  center.x  = ($containerWidth / 2) + x * currentScale;
                //  center.y  = ($containerWidth / 2) + y * currentScale;

                //  if (fn.zoom(zoom)) {
                //      if (Math.abs(posX) > 5 && Math.abs(posy) > 5) {
                //          var switcher = (zoom > 1) ? 1 : -1;

                //          posX = switcher * posX * (zoom - 1);
                //          posy = switcher * posy * (zoom - 1);

                //          fn.move({
                //              'x': posX,
                //              'y': posy
                //          });
                //      }

                //      fn.move({
                //          'x': (e.position.x / $containerWidth * viewBoxWidth * scale * -1),
                //          'y': ((e.position.y - $containerOffset.top) / $containerHeight * viewBoxHeight * scale * -1)
                //      });
                //  }
                // }

                // Magnifies and shrinks the illustration
                fn.zoom = function(scaleFactor) {
                    if (scaleFactor) {
                        var tmp = currentScale * scaleFactor;

                        // Zoomrange between 1/2 and 10 times
                        if((tmp * 2 > defaultScale || scaleFactor > 1 ) && (tmp / 10 < defaultScale || scaleFactor < 1)) {
                            currentScale = tmp;
                        } else {
                            return false;
                        }

                    } else {
                        currentScale = defaultScale;
                    }
                    
                    fn.transform(currentScale, x, y);

                    return true;
                };

                // Moves the illustration
                fn.move = function(offset, absolute) {
                    if (offset) {
                        if (absolute) {
                            x = -offset.x;
                            y = -offset.y;
                        } else {
                            x += offset.x;
                            y += offset.y;
                        }
                    } else {
                        // Reset to default coordinates
                        x = 0
                        y = 0
                    }
                    
                    fn.transform(currentScale, x, y);
                };

                fn.autoZoom = function (id) {
                    var el,
                        dim,
                        centerX,
                        centerY,
                        unitRelSize,
                        unitAbsSize,
                        scaleFactor;

                    if (!autoTransformed) {
                        // Store old coordinates and scale
                        oldX = x;
                        oldY = y;
                        lastScale = currentScale;
                    }

                    if (Object.prototype.toString.call( units[id] ) === '[object Array]') {
                        // Multiple units
                        var minX = Number.MAX_VALUE,
                            minY = Number.MAX_VALUE,
                            maxX = Number.MIN_VALUE,
                            maxY = Number.MIN_VALUE,
                            width,
                            height;

                        for (var i = groups[id].length - 1; i >= 0; i--) {
                            var dim = groups[id][i].node.getBBox();

                            if (dim.x < minX) {
                                minX = dim.x;
                            }
                            if (dim.y < minY) {
                                minY = dim.y;
                            }
                            if (dim.x > maxX) {
                                maxX = dim.x;
                                width = dim.width;
                            }
                            if (dim.y > maxY) {
                                maxY = dim.y;
                                height = dim.height;
                            }
                        };
                    } else if (typeof units[id] === 'number') {
                        // Single unit
                        el      = vectorElements[units[id]].node;
                        dim     = el.getBBox();
                        minX    = dim.x;
                        minY    = dim.y;
                        width   = dim.width;
                        height  = dim.height;
                    }


                    var centerX     = (minX + width / 2 - defaultCords.x) / initialScale,
                        centerY     = (minY + height / 2 - defaultCords.y) / initialScale,
                        unitRelSize = {
                            width: width * currentScale / initialScale / $containerWidth,
                            height: height * currentScale / initialScale / $containerHeight
                        },
                        unitAbsSize = {
                            width: width / initialScale / $containerWidth,
                            height: height / initialScale / $containerHeight
                        },
                        scaleFactor = 0.05 / Math.min(unitRelSize.width, unitRelSize.height);


                    if (unitAbsSize.width < 0.04 && unitAbsSize.height < 0.1 || (unitAbsSize.height < 0.04 && unitAbsSize.width > 0.1)) {
                        currentScale = Math.min(Math.max(0.5, currentScale * scaleFactor), 10);

                        x = ($containerWidth / 2) - (centerX);
                        y  = ($containerHeight / 2) - (centerY);

                        autoTransformed = true;
                    } else if (autoTransformed) {
                        // Reset last coordinated and scale
                        x = oldX;
                        y = oldY;
                        currentScale = lastScale;
                        autoTransformed = false;
                    } else return;

                    fn.transform(currentScale, x, y, true);
                };

                fn.transform = function (scale, x, y, smooth) {
                    if (smooth) {
                        paper.canvas.setAttribute('class', 'smooth');
                    } else {
                        paper.canvas.setAttribute('class', '');
                    }
                    $svg.css('-webkit-transform', 'scale(' + scale + ') translate(' + x + 'px, ' + y + 'px)');
                    $svg.css('-moz-transform', 'scale(' + scale + ') translate(' + x + 'px, ' + y + 'px)');
                    $svg.css('-ms-transform', 'scale(' + scale + ') translate(' + x + 'px, ' + y + 'px)');
                    $svg.css('-o-transform', 'scale(' + scale + ') translate(' + x + 'px, ' + y + 'px)');
                    $svg.css('transform', 'scale(' + scale + ') translate(' + x + 'px, ' + y + 'px)');
                };


                ///////////////////////////////////////////////////////////////////////
                // Event Handler
                ///////////////////////////////////////////////////////////////////////

                $element
                    .hammer({
                        // Configuration for the Hammer.js library
                        prevent_default: true,
                        doubletap_distance: 30
                    })
                    .on('dragstart', function(e){ fn.mousedown(e) })
                    .on('drag', function(e){ fn.mousemove(e) })
                    .on('dragend', function(e){ fn.mouseup(e) })
                    .on('doubletap', function(e){ fn.dblclick(e.target, e.gesture.srcEvent.pageX, e.gesture.srcEvent.pageY) })
                    .on('mousewheel', function(e, d, dX, dY){ fn.mousewheel(e, d) })
                    .on('transform', function(e) { fn.transform(e) });

                $svg
                    .hammer({
                        // Configuration for the Hammer.js library
                        prevent_default: true,
                        doubletap_distance: 30
                    })
                    .on('mouseover', function(e){ fn.mouseover(e) })
                    .on('mouseout', function(e){ fn.mouseout(e) })
                    .on('tap', function(e) {
                        fn.click(e.target);
                        if (!$zoomDialog.find(e.target).length) {
                            fn.showZoomDialog();
                        }
                    });

                $($window).on('resize', function() { fn.resizePaper() });

                // Check if the activeUnit has already been set before the directory loaded
                if (News.activeUnit)
                {
                    $scope.activeUnit = News.activeUnit;
                }

                // Start spinner
                var spinner = Spinner(paper, $containerWidth, $containerHeight);
            }
        }
    }])
    .directive('units', ['$timeout', 'News', function($timeout, News) {
        // Enables the unit container to updates it height according to the  accordion below.
        return function(scope, element) {
            var list = element.find('ol')[0],
                fn = {},
                i = 0;

            // Listens for when the 'infoHeight' is broad-casted by the News service
            scope.$on('infoHeight', function() {
                element.css('bottom', News.infoHeight + 'px');
            });

            scope.$watch('activeUnit', function(newValue, oldValue) {
                var $unit;

                if (newValue) {
                    i = 0;
                    fn.checkUnit(newValue);
                }
            });

            scope.$on('hoverUnit', function() {
                fn.scrollTo(News.hoverUnit);
            });

            fn.checkUnit = function(unit) {
                i++;
                var $unit = $('#unit_' + unit);
                if ($unit.length) {
                    fn.scrollTo(scope.activeUnit, $unit);
                } else {
                    if (i <= 10) {
                        $timeout(function(){
                            fn.checkUnit(unit);
                        }, 100);
                    }
                }
            };

            fn.scrollTo = function (unit, $unit) {
                var top = $unit.offset().top;
                var height = element.height();

                /*
                    Offset is relative to the window thus we have to substract 64px of the two topbars
                    We have to add 27px to make it fully visible (21px for the label + 6px for a bit of padding)
                    We have to add 24px as the units topbar is not part of scolling but adds up to the height of the container
                    -64px + 27px + 24px = -13px
                 */

                if (top - 13 > height) {
                    list.scrollTop = list.scrollTop + (top - height - 13);
                } else if (top < 71) {
                    list.scrollTop = list.scrollTop - (71 - top);
                }
            };
        }
    }])
    .directive('accordion', ['News', function(News) {
        // Applies an accordion effect
        return function(scope, element) {
            var $element = $(element),
                outerHeight = $element.parent().outerHeight(),
                fn = {},
                height;

            News.setInfoHeight($element.outerHeight());

            scope.$on('sliderHeight', function(e, h) {
                if ((height && h < height) || !height) {
                    height = h;
                }
            });

            // Listens for the resize event which is fired when an accordions element is toggled
            $element.on('resizing', function() {
                // Recursive method that checks every 50ms the height of the accordion and calls the News service to if changes are detected
                // Method terminates itself of no changes are detected
                (function checkSize(oldSize) {
                    setTimeout(function(){
                        var h = $element.outerHeight();
                        if (h !== oldSize) {
                            checkSize(h);
                        } else {
                            News.setInfoHeight(h);
                            // scope.$apply();  // Lets AngularJS digest changes (need if an external library does changes)
                        }
                    }, 50);
                })($element.outerHeight(), true);
            });

            // Toggles the visibility of an element of the accordion
            scope.toggle = function(e, disabled, news, customHeight) {
                fn.toggle($(e.target).parent(), disabled, news, customHeight);
            };

            fn.toggle = function(el, disabled, news, customHeight) {
                var body = el.children('div.body');

                if (!disabled && !el.hasClass('error')) {

                    if (body.height() > 0) {
                        body.css('height', 0);
                        body.parent().addClass('closed');
                        if (news) {
                            // Broadcast news only when the heat-map container is closed
                            scope.$emit(news);
                        }

                        // Broadcast opened section
                        News.setActivePanel();
                    } else {
                        body.css('height', (height || (outerHeight * 0.5 - 72)) + 'px'); // 72 = 24 * 3 (H2 Elemente)
                        body.parent().removeClass('closed');

                        // Broadcast opened section
                        News.setActivePanel(el[0].id);
                    }

                    el.siblings().children('div.body').css('height', 0);
                    el.siblings().children('div.body').parent().addClass('closed');

                    // Trigger event so that jQuery knows it has to watch for a new height
                    el.trigger('resizing');
                }
            }
            
            // fn.toggle($element.children("section:first"));
        }
    }])
    .directive('searchResultsCenter', function() {
        return function(scope, element) {
            // Center search results vertically
            element.css('top', '-' + (element.prev().outerHeight() / 2) + 'px');
        }
    })
    .directive('sliderImg', ['News', '$timeout', '$http', function(News, $timeout, $http) {
        return {
            restrict: 'E',
            scope: {
                picture: '@'
            },
            template: '<img ng-src="{{ src }}" ng-show="active" />',
            replace: true,
            link: function(scope, element) {
                var fn = {
                    checkImageSrc: function () {
                        element.on('load', function () {
                            scope.active = true;
                            fn.checkHeight();
                            News.broadcast('sliderImageOkay');
                            return true;
                        });
                        element.on('error', function () {
                            scope.active = false;
                            return false;
                        });
                    },
                    setSrc: function () {
                        fn.checkImageSrc();
                        scope.src = 'http://cellfinder.org/omero/webgateway/render_thumbnail/' + scope.picture + '/' + News.sliderWidth + '/';
                    },
                    checkHeight: function () {
                        var i = 0;
                        (function checkHeight(height) {
                            $timeout(function(){
                                if (height == 0 && i < 25) {
                                    ++i;
                                    checkHeight(element.height());
                                } else if (height > 0 && i < 25) {
                                    News.broadcast('sliderHeight', height);
                                }
                            }, 100);
                        })(element.height());
                    },
                    checkPicture: function () {
                        if (scope.picture && scope.picture.length) {
                            fn.setSrc();
                        } else {
                            scope.$watch('picture', function(value) {
                                if (value && value.length) {
                                    fn.setSrc();
                                }
                            });
                        }
                    }
                };

                if (News.sliderWidth) {
                    fn.checkPicture();
                } else {
                    scope.$on('sliderWidth', function () {
                        fn.checkPicture();
                    });
                }

            }
        };
    }])
    .directive('horizontalSlider', ['News', function(News) {
        // Horizontal Slider for the search results
        return {
            restrict: 'AE',
            transclude: true,
            template: '<div line-height class="left icon button" data-icon="<" ng-click="scroll(\'prev\')">Prev</div><div line-height class="right icon button" data-icon=">" ng-click="scroll(\'next\')">Next</div><div ng-transclude></div>',
            scope: {
                data: '=',
                numVisibleItems: '@'
            },
            link: function (scope, element, attrs) {
                var hSlider = {
                    'currentPos'    : 1,
                    'numEntries'    : 0,
                    'totalWidth'    : 0,
                    'itemWidth'     : 0,
                    'button'        : element.find('div.button'),
                    'ul'            : element.find('ul'),
                    'disabled'      : true
                };
                // Give 'margin-left' a value
                hSlider.ul.css('margin-left', '0%');

                News.setSliderWidth(element.width());

                scope.$on('sliderHeight', function(e, h) {
                    hSlider.button.css('line-height', h + 'px');
                });

                // Watch for the number of search results and adjust the container widths accordingly
                scope.$watch(function() {
                    return scope.data;
                }, function(data) {
                    if (typeof data === 'object') {
                        // Update properties
                        hSlider.numEntries = data.length;

                        scope.$on('ngRepeatFinished', function() {
                            hSlider.li = element.find('li');

                            // Set UL width to ceil(number of items / numVisibleItems)
                            // Set LI width to UL-Width / numVisibleItems
                            if (data.length > scope.numVisibleItems) {
                                hSlider.button.removeClass('disabled'); 
                                hSlider.disabled = false;                   
                                hSlider.ul.css('width', ((hSlider.numEntries / scope.numVisibleItems) * 100) + '%');
                                hSlider.li.css('width', (100 / hSlider.numEntries) + '%');
                            } else {
                                hSlider.button.addClass('disabled');
                                hSlider.disabled = true;
                                hSlider.ul.css('width', '100%');
                                hSlider.li.css('width', (100 / scope.numVisibleItems) + '%');
                            }

                            hSlider.itemWidth = (100 / scope.numVisibleItems);
                            hSlider.totalWidth = hSlider.itemWidth * hSlider.numEntries;

                            // Reset position
                            hSlider.currentPos = 1;
                            hSlider.transition(0, 0);
                        });
                    }
                });

                scope.scroll = function(dir) {
                    if (hSlider.disabled || hSlider.currentPos === 0) return;

                    var loc = hSlider.itemWidth;

                    ( dir === 'next' ) ? ++hSlider.currentPos : --hSlider.currentPos;

                    if ( hSlider.currentPos === 0 ) {
                        hSlider.currentPos = hSlider.numEntries;
                        loc = hSlider.totalWidth - hSlider.itemWidth;
                        dir = 'next';
                    } else if ( hSlider.currentPos - 1 === hSlider.numEntries ) {
                        hSlider.currentPos = 1;
                        loc = 0;
                    }

                    hSlider.transition( loc, dir );
                }

                hSlider.transition = function(loc, dir) {
                    var newMargin; // -= +=

                    if ( dir && loc !== 0 ) {
                        newMargin = (hSlider.currentPos -1) * hSlider.itemWidth;
                    } else {
                        newMargin = loc;
                    }

                    hSlider.ul.css('margin-left', '-' + newMargin + '%');
                }
            }
        }
    }])
    .directive('helpMessage', function() {
        return {
            restrict: 'A',
            scope: {
                closeHelpMessage: '&'
            },
            link: function(scope, element) {
                scope.close = function(event) {
                    if (event) {
                        if (element[0].id === event.target.id) {
                            setTimeout(scope.closeHelpMessage(), 2000);
                        }
                    } else {
                        setTimeout(scope.closeHelpMessage(), 2000);
                    }
                }
            }
        }
    });