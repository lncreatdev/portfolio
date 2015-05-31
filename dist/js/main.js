/*jshint -W081 */

var lncd = {};

lncd.modules = lncd.modules || {};
lncd.components = lncd.components || {};
lncd.services = lncd.services || {};

lncd.services.ResizeManager = (function (window) {
    'use strict';
    var ResizeManager = {};

    function _matchSize (breakpoint) {
        var mq = window.matchMedia('only screen and (min-width:' + breakpoint + 'px)');
        return mq.matches;
    }

    ResizeManager.breaks = {
        NARROW: 320,
        NARROWER: 480,
        MEDIUM: 768,
        WIDE: 1025,
        WIDEST: 1440
    };

    ResizeManager.events = {
        RESIZE: 'resize',
        CHANGE: 'change'
    };

    ResizeManager.matchSize = _matchSize;

    return ResizeManager;

} (window));

lncd.modules.Navigation = (function ($, ResizeManager, window) {
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

        currentView,
        currentIndex;

    function _setSlideFocusTo(index) {
        console.log('_setSlideFocusTo with index ' + index);
        _selectLink(index);
        _setRoute(index);
    }

    function _setRoute(index) {
        var index = index || currentIndex,
            $slide = $slides.eq(index),
            location = '#' + $slide.attr('id'),
            page = index + 1,
            title = $navLinks.eq(index).text();

        window.history.pushState({page: page}, title, location);
        console.log('_setRoute with index: ' + index);
        window.location.hash = location;
    }

    function _initRoute() {
        var locationString = window.location.hash.substr(1),
            currentHash = locationString || $slides.eq(0).attr('id');

        $slides.each(function(currentSlideIndex) {
            var $slide = $(this),
                slideID = $slide.attr('id');
            if (slideID === currentHash) {
                currentIndex = currentSlideIndex;
            }
        });
        console.log(currentIndex);
    }

    function _scrollTo(index, seconds, offset) {
        var defaultSpeed = 1.5,
            seconds = seconds || defaultSpeed,//TODO: use config
            speed = seconds * 1000,
            offset = offset || 0,
            $html = $(selectors.HTML + ',' + selectors.BODY),
            $element = $slides.eq(index);

        console.log('offset ' + offset);

        $html.animate({
            scrollTop: $element.offset().top - offset
        }, speed);
    }

    function _selectLink(index) {
        var $link = $navLinks.eq(index) || $navLinks.eq(0);

        $navLinks.removeClass(classes.SELECTED);
        $link.addClass(classes.SELECTED);
    }

    function _switchView() {
        if (ResizeManager.matchSize(ResizeManager.breaks.MEDIUM)) {
            Navigation.setView('tablet');
        }
        else if (ResizeManager.matchSize(ResizeManager.breaks.NARROW)) {
            Navigation.setView('mobile');
        }
    }

    Navigation.views =  Navigation.views || {};

    Navigation.views.mobile = (function () {
        var view = {},
            selectors = {
                ICON_MENU: '.icon-menu'
            },
            classes = {
                EXPANDED: 'expanded'
            },
            $navButton = $(selectors.ICON_MENU);

        function _toggleMenu (evt) {
            $mainNav.toggleClass(classes.EXPANDED);
            $navButton.toggleClass(classes.EXPANDED);
        }

        function _navigate (evt) {
            evt.preventDefault();
            currentIndex = $(this).parent().index();
            _toggleMenu();
            _scrollTo(currentIndex);
        }

        view.init = function () {
            $navLinks.on(events.CLICK, _navigate);
            $navButton.on(events.CLICK, _toggleMenu);
        };

        view.clear = function () {
            $navLinks.off(events.CLICK, _navigate);
            $navButton.off(events.CLICK, _toggleMenu);
            $mainNav.removeClass(classes.EXPANDED);
        };

        view.toggleMenu = _toggleMenu;

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
            $firstSlide = $(selectors.HOME_SLIDE);

        function _navigate (evt) {
            console.log('_navigate tbt');
            evt.preventDefault();
            currentIndex = $(this).parent().index();
            _scrollTo(currentIndex, null, $mainNav.height());
        }

        view.init = function () {
            $navLinks.on(events.CLICK, _navigate);
        };

        view.togglePosition = function ($window) {
            var firstElementHeight = $firstSlide.height()/2;

            if ($window.scrollTop() >= firstElementHeight) {
                $mainNav.addClass(classes.FIXED_TOP);
                return;
            }
            $mainNav.removeClass(classes.FIXED_TOP);
        };

        view.clear = function () {
            $navLinks.off(events.CLICK, _navigate);
        };

        return view;
    }());

    Navigation.init = function () {
        _switchView();
        $window.on(events.LOAD, function () {
            _initRoute();
            _scrollTo(currentIndex, 0);
            _setSlideFocusTo(currentIndex);
        });
        $window.on(ResizeManager.events.RESIZE, _switchView);
        $window.on(events.POP_STATE, function () {
            console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
            _scrollTo(event.state.page-1, 0);
        });
    };

    Navigation.setView = function (type) {
        if (currentView) {
            currentView.clear();
        }
        currentView = this.views[type];
        currentView.init();
    };

    Navigation.getView = function () {
        if (currentView) {
            return currentView;
        }
    };

    var arr = [0],
        count = 0;
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
                    _setSlideFocusTo(currentIndex);
                }
            }
        }
    };

    Navigation.switchView = _switchView;

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

    Navigation.scrollTo = _scrollTo;

    Navigation.setRoute = _setRoute;

    Navigation.selectLink = _selectLink;

    return Navigation;

}(jQuery, lncd.services.ResizeManager, window));

lncd.services.Scrolling = (function ($, window, Navigation) {
    'use strict';
    var ScrollingService = {},
        selectors = {
            SCROLLING_ENABLED: '.scrolling-enabled'
        },
        consts = {
            SPEED: 'speed',
            OFFSET: 'offset'
        };

    ScrollingService.init = function () {
        var $scrollBackgrounds = $(selectors.SCROLLING_ENABLED),
            $window = $(window);

        // toggles position when scrolling down
        if(Navigation.getView().togglePosition) {
            Navigation.getView().togglePosition($window);
        }

        $scrollBackgrounds.each(function () {
            var $bgElement = $(this);
            $window.scroll(function () {
                var speed = $bgElement.data(consts.SPEED),
                    offset = $bgElement.data(consts.OFFSET) || 0,
                    yPosition = ($window.scrollTop() / speed) - offset,
                    coords = '50% ' + yPosition + 'px';

                $bgElement.css({backgroundPosition: coords});

                //  toggles position when scrolling down
                if(Navigation.getView().togglePosition) {
                    Navigation.getView().togglePosition($window);
                }

                Navigation.updateFocus($bgElement);
            });
        });
    };

    return ScrollingService;

}(jQuery, window, lncd.modules.Navigation));


lncd.modules.ContactForm = (function ($, window) {
    'use strict';
    var ContactForm = {},
        selectors = {
            SUBMIT_BUTTON: '#contact-form-submit',
            USER_NAME: '#name',
            USER_PHONE: '#phone',
            USER_EMAIL: '#email',
            USER_SUBJECT: '#subject',
            USER_MESSAGE: '#message'
        },
        events = {
            CLICK: 'click'
        },
        _self;


    ContactForm.init = function () {
        var $submitButton = $(selectors.SUBMIT_BUTTON)

        _self = this;
        $submitButton.on(events.CLICK, _self.submit);
    };

    ContactForm.submit = function (evt) {
        evt.preventDefault();

        var userName = $(selectors.USER_NAME).val(),
            userPhone = $(selectors.USER_PHONE).val(),
            userEail = $(selectors.USER_EMAIL).val(),
            userSubject = $(selectors.USER_SUBJECT).val(),
            userMessage = $(selectors.USER_MESSAGE).val(),
            userContactDetails = {
                name: userName,
                phone: userPhone,
                email: userEail,
                subject: userSubject,
                message: userMessage
            },
            jqxhr = $.ajax({
            url: '/sendquestion',
            type: 'POST',
            data:  userContactDetails
        });

        jqxhr.done(_self.submitSuccessHandler);
        jqxhr.fail(_self.submitFailureHandler);
    };

    ContactForm.submitSuccessHandler = function (data) {
        alert('Message have been sent');
    };

    ContactForm.submitFailureHandler = function (data) {
        alert('Message could not be sent');
    };

    return ContactForm;

}(jQuery));

lncd.app = (function (Navigation, Scrolling, ContactForm) {
    var app = {};

    app.init = function () {
        Navigation.init();
        Scrolling.init();
        ContactForm.init();
    };

    app.init();

    return app;

}(lncd.modules.Navigation, lncd.services.Scrolling, lncd.modules.ContactForm));
