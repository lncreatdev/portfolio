module.exports = function(config) {
    config.set({

        frameworks: [ 'browserify', 'jasmine'],

        files: ['test/*.js', 'test/**/*.js'],

        exclude: ['test/file_content.js', 'test/file_existence.js' ],

        preprocessors: {
            'test/*.js': [ 'browserify' ],
            'test/**/*.js': [ 'browserify' ]
        },

        browserify: {
            debug: true
        },

        reporters: ['spec'],

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ['Chrome'],

        singleRun: false
    });
}
