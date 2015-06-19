var fs = require('fs');
var path = require('path');

var modernizr = require('gulp-modernizr');

var gulp = require('gulp');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var es = require('event-stream');
var glob = require('glob');
var gutil = require('gulp-util');
var karma = require('karma');
var jasmine = require('gulp-jasmine');
var jasmineBrowser = require('gulp-jasmine-browser');
var mocha = require('gulp-mocha');
var assign = require('lodash.assign');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var less = require('gulp-less');
var watch = require('gulp-watch');
var notify = require('gulp-notify');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

var plugins = require('gulp-load-plugins')(); // Load all gulp plugins
                                              // automatically and attach
                                              // them to the `plugins` object

var runSequence = require('run-sequence');    // Temporary solution until gulp 4
                                              // https://github.com/gulpjs/gulp/issues/355

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

var testFiles = glob.sync(dirs.src + '/js/**/*.js');
var customOpts = {
    entries: testFiles,
    debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = glob.sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath)
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist
    ], done);
});

gulp.task('copy', [
    'copy:.htaccess',
    'copy:index.html',
    'copy:jquery',
    'copy:misc'
]);

gulp.task('copy:.htaccess', function () {
    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
               .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:index.html', function () {
    return gulp.src(dirs.src + '/index.html')
               .pipe(plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
               .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
               .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:main.css', function () {

    var banner = '/*! HTML5 Boilerplate v' + pkg.version +
                    ' | ' + pkg.license.type + ' License' +
                    ' | ' + pkg.homepage + ' */\n\n';

    return gulp.src(dirs.src + '/css/main.css')
               .pipe(plugins.header(banner))
               .pipe(gulp.dest(dirs.dist + '/css'));

});

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/index.html',
        '!' + dirs.src + '/less{,/**}',
        '!' + dirs.src + '/js/**/*!(bundle.min.js | *.map | plugins.js)',
        '!' + dirs.src + '/doc{,/**}'

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});

/* gulp.task('copy:normalize', function () {
    return gulp.src('node_modules/normalize.css/normalize.css')
               .pipe(gulp.dest(dirs.dist + '/css'));
}); */

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/*.js',
        dirs.test + '/*.js'
    ]).pipe(plugins.jscs())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('browserify', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
    return b.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error')) // log errors if they happen
        .pipe(source('bundle.js')) // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from Browserify file
        // Transformation tasks to the pipeline start here.
        .pipe(streamify(uglify({ mangle: false })))
        .pipe(rename({suffix: '.min' }))
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest(dirs.dist + '/js'))
        .pipe(livereload())
        .pipe(notify());
}


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
    done);
});

gulp.task('serve', function () {
    nodemon({ script: 'app.js',
          ext: 'html js',
       // , ignore: ['ignored.js']
          tasks: ['js', 'html', 'less'] })
        .on('restart', function () {
            console.log('restarted!')
        });
});

gulp.task('build', function (done) {
    runSequence(
        ['clean'/*, 'lint:js'*/],
        'copy', 'browserify',
    done);
});

gulp.task('less', function() {
    return gulp.src(dirs.src + '/less/main.less')
        .pipe(less())
        .pipe(gulp.dest(dirs.dist + '/css'))
        .pipe(livereload())
        .pipe(notify());
});

gulp.task('modernizr', function() {
    gulp.src(dirs.src + '/js/*.js')
        .pipe(modernizr())
        .pipe(gulp.dest('build/'));
});

gulp.task('test:karma', function () {
    return karma.server.start({
        configFile: __dirname+'/karma.conf.js',
        singleRun: true
    });
});

/*gulp.task('test:jasmine', function () {
    return gulp.src([dirs.test + '/!*.js',
        '!' + dirs.test + '/file_content.js',
        '!' + dirs.test + '/file_existence.js'])
        .pipe(jasmine());
});

gulp.task('test:mocha', function () {
    return gulp.src(['!' + dirs.test + '/!*.js',
        dirs.test + '/file_content.js',
        dirs.test + '/file_existence.js'])
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('jasmine', function() {
    var filesForTest = [dirs.test + '/!*.js',
        '!' + dirs.test + '/file_content.js',
        '!' + dirs.test + '/file_existence.js'];
    return gulp.src(filesForTest)
        .pipe(watch(filesForTest))
        .pipe(jasmineBrowser.specRunner())
        .pipe(jasmineBrowser.server({port: 8888}));
});*/

gulp.task('html', function () {
    return gulp.src(dirs.src + '/*.html')
        .pipe(plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
        .pipe(gulp.dest(dirs.dist))
        .pipe(livereload())
        .pipe(notify());
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch([dirs.src + '/*.html'], ['html']);
   // gulp.watch([dirs.src + '/js/**/*.js'], ['js']);
    gulp.watch([dirs.src + '/less/*.less'], ['less']);
});

gulp.task('default', ['test:karma', 'build', 'serve', 'watch']);
