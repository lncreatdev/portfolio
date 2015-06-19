var $ = require('jquery'),
    ResizeManager = require('../services/resizemanager.js'),
    ParallaxScrolling = require('../services/parallaxscrolling.js');

module.exports = (function () {
    'use strict';
    var Navigation = {},
        selectors = {
            HTML: 'html',
            BODY: 'body',
            ANCHOR: 'a',
            LIST: 'li',
            MAIN_NAV: '.main-nav',
            NAV_LINKS: '.main-nav-links',
            SLIDE: '.slide',
            SCROLL_ELEMENT: '.scrolling-enabled'
        },

        events = {
            CLICK: 'click',
            POP_STATE: 'popstate',
            LOAD: 'load'
        },
        classes = {
            SELECTED: 'selected'
        },

        $window = $(window),
        $mainNav = $(selectors.MAIN_NAV),
        $navLinks = $(selectors.NAV_LINKS).find(selectors.ANCHOR),
        $slides = $(selectors.SLIDE),

        arr = [0],
        count = 0,

        currentView,
        currentIndex,

        scrollOfffset,

        _self;

    Navigation.views = Navigation.views || {};

    Navigation.views.mobile = (function () {
        var view = {},
            selectors = {
                ICON_MENU: '.icon-menu'
            },
            classes = {
                EXPANDED: 'expanded'
            },
            $navButton = $(selectors.ICON_MENU),
            _self;

        view.init = function () {
            _self = this;
            scrollOfffset = 0;
            $navLinks.on(events.CLICK, _self.navigate);
            $navButton.on(events.CLICK, _self.toggleMenu);
        };

        view.clear = function () {
            scrollOfffset = null;
            $navLinks.off(events.CLICK, _self.navigate);
            $navButton.off(events.CLICK, _self.toggleMenu);
            $mainNav.removeClass(classes.EXPANDED);
        };

        view.toggleMenu = function () {
            $mainNav.toggleClass(classes.EXPANDED);
            $navButton.toggleClass(classes.EXPANDED);
        };

        view.navigate = function (evt) {
            if(evt) {
                evt.preventDefault();
            }
            currentIndex = $(this).parent().index();
            _self.toggleMenu();
            _self.scrollTo(currentIndex, null, 0);
        };

        return view;
    }());

    Navigation.views.tablet = (function () {
        var view = {},
            selectors = {
                HOME_SLIDE: '#home'
            },
            classes = {
                FIXED_TOP: 'fixed-top'
            },
            $firstSlide = $(selectors.HOME_SLIDE),
            _self;

        view.init = function () {
            _self = this;
            scrollOfffset = $mainNav.height();
            $navLinks.on(events.CLICK, _self.navigate);
        };

        view.clear = function () {
            scrollOfffset = null;
            $navLinks.off(events.CLICK, _self.navigate);
        };

        view.togglePosition = function ($window) {
            var firstElementHeight = $firstSlide.height()/2;

            if ($window.scrollTop() >= firstElementHeight) {
                $mainNav.addClass(classes.FIXED_TOP);
                return;
            }
            $mainNav.removeClass(classes.FIXED_TOP);
        };

        view.navigate = function (evt) {
            if (evt) {
                evt.preventDefault();
            }
            currentIndex = $(this).parent().index();
            _self.scrollTo(currentIndex);
        };

        return view;
    }());

    Navigation.init = function () {
        _self = this;
        _self.switchView();

        if (_self.getView().togglePosition) {
            _self.getView().togglePosition($window);
        }

        $window.on(events.LOAD, function () {
            _self.initRoute();
            _self.scrollTo(currentIndex);
            _self.setSlideFocusTo(currentIndex);
        });

        $window.on(ResizeManager.events.RESIZE, _self.switchView);
        $window.on(events.POP_STATE, function () {
            //console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
            _self.scrollTo(event.state.page-1, 0);
        });

        ParallaxScrolling.init(_self.updateOnParallaxScroll);
    };

    Navigation.setView = function (type) {
        if (currentView) {
            currentView.clear();
        }
        currentView = _self.views[type];
        currentView.scrollTo = _self.scrollTo;
        currentView.init();
    };

    Navigation.getView = function () {
        if (currentView) {
            return currentView;
        }
    };

    Navigation.updateOnParallaxScroll = function ($element) {
        //  toggles position when scrolling down
        if (_self.getView().togglePosition) {
            _self.getView().togglePosition($window);
        }

        _self.updateFocus($element);
    };

    Navigation.updateFocus = function ($element) {
        //sets link and path to according slide when scrolling has reached the slide
        var slideClass = selectors.SLIDE.substr(1);

        if($element.hasClass(slideClass)) {
            var slideOffset = 100,
                scrollTop = $window.scrollTop(),
                slideIndex = $element.index(selectors.SLIDE),
                $slide = $element,
                slidePositionTop = $slide.position().top - slideOffset;

            if(scrollTop >= slidePositionTop && scrollTop < slidePositionTop + $slide.height()) {
                count ++;
                arr[count] = slideIndex;

                if(arr[count] !== arr[count-1]) {
                    currentIndex = slideIndex;
                    _self.setSlideFocusTo(currentIndex);
                }
            }
        }
    };

    Navigation.switchView = function () {
        if (ResizeManager.matchSize(ResizeManager.breaks.MEDIUM)) {
            Navigation.setView('tablet');
        }
        else if (ResizeManager.matchSize(ResizeManager.breaks.NARROW)) {
            Navigation.setView('mobile');
        }
    };

    /* Navigation.views.base = function () {
     var view = {};

     view.init = function () {
     console.log('base - init');
     };

     view.clear = function () {
     console.log('base - clear');
     };

     return view;
     }; */

    Navigation.setSlideFocusTo = function (index) {
        _self.selectLink(index);
        _self.setRoute(index);
    };

    Navigation.scrollTo = function (index, seconds, offset) {
        var defaultSpeed = 1.5,
            seconds = seconds || defaultSpeed,//TODO: use config
            speed = seconds * 1000,
            offset = offset || scrollOfffset,
            $html = $(selectors.HTML + ',' + selectors.BODY),
            $element = $slides.eq(index);

        $html.animate({
            scrollTop: $element.offset().top - offset
        }, speed);
    };

    Navigation.setRoute = function (index) {
        var index = index || currentIndex,
            $slide = $slides.eq(index),
            location = '#' + $slide.attr('id'),
            page = index + 1,
            title = $navLinks.eq(index).text();

        window.history.pushState({page: page}, title, location);
        window.location.hash = location;
    };

    Navigation.initRoute = function () {
        var locationString = window.location.hash.substr(1),
            currentHash = locationString || $slides.eq(0).attr('id');

        $slides.each(function(currentSlideIndex) {
            var $slide = $(this),
                slideID = $slide.attr('id');
            if (slideID === currentHash) {
                currentIndex = currentSlideIndex;
            }
        });
    };

    Navigation.selectLink = function (index) {
        var $link = $navLinks.eq(index) || $navLinks.eq(0);

        $navLinks.removeClass(classes.SELECTED);
        $link.addClass(classes.SELECTED);
    };

    return Navigation;

}());
