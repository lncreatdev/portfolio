var $ = require('jquery');

module.exports = (function () {
    'use strict';
    var ParallaxScrolling = {},
        selectors = {
            SCROLLING_ENABLED: '.scrolling-enabled'
        },
        consts = {
            SPEED: 'speed',
            OFFSET: 'offset'
        },
        events = {
            SCROLL: 'scroll'
        },
        $window = $(window),
        _self;

    ParallaxScrolling.init = function (onScrollCallbackFn) {
        var $scrollBackgrounds = $(selectors.SCROLLING_ENABLED);

        _self = this;
        _self.onScrollActiveCallback = onScrollCallbackFn;
        _self.animateParallaxBackgrounds($scrollBackgrounds);
    };

    ParallaxScrolling.animateParallaxBackgrounds = function ($backgrounds) {
        $backgrounds.each(function () {
            var $bgElement = $(this);

            $window.on(events.SCROLL, function () {
                var speed = $bgElement.data(consts.SPEED),
                    offset = $bgElement.data(consts.OFFSET) || 0,
                    yPosition = ($window.scrollTop() / speed) - offset,
                    coords = '50% ' + yPosition + 'px';

                $bgElement.css({backgroundPosition: coords});

                _self.onScrollActiveCallback($bgElement);
            });
        });
    };

    return ParallaxScrolling;

}());
