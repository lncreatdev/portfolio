var $ = require('jquery');

module.exports = (function () {
    'use strict';
    var Gallery = {},
        selectors = {
            THUMB_BUTTON_INFO: '.thumb-button-info',
            THUMB_BUTTON_CLOSE: '.thumb-button-close',
            GALLERY_THUMB_OVERLAY: '.gallery-thumb-overlay',
            GALLERY_THUMB: '.gallery-thumb'
        },
        events = {
            CLICK: 'click'
        },
        classes = {
            VISIBLE: 'visible'
        },
        $galleryThumbnailOverlay = $(selectors.GALLERY_THUMB_OVERLAY),

        _self;

    Gallery.init = function () {
        var $thumbnailInfoButton = $(selectors.THUMB_BUTTON_INFO),
            $thumbnailCloseInfoButton = $(selectors.THUMB_BUTTON_CLOSE);

        _self = this;

        $thumbnailInfoButton.on(events.CLICK, _self.toggleThumbInfoOverlay);
        $thumbnailCloseInfoButton.on(events.CLICK, _self.toggleThumbInfoOverlay);
    };

    Gallery.toggleThumbInfoOverlay = function (evt) {
        evt.preventDefault();

        var $target = $(this),
            index = $target.closest(selectors.GALLERY_THUMB).index();
        $galleryThumbnailOverlay.eq(index).toggleClass(classes.VISIBLE);
    };

    return Gallery;

} ());
