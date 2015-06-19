module.exports = (function () {
    'use strict';
    var ResizeManager = {};

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

    ResizeManager.matchSize = function (breakpoint) {
        var mq = window.matchMedia('only screen and (min-width:' + breakpoint + 'px)');
        return mq.matches;
    };

    return ResizeManager;

} ());
