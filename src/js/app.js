module.exports = (function () {
    'use strict';

    var app = {};

    app.init = function (modules) {
        for (var i = 0, length = modules.length; i < length; i ++) {
            modules[i].init();
        }
    };

    return app;

}());
