var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    karma = require('karma').server,
    libs = [
        'libs/three.js',
        'libs/PointerLockControls.js',
        'libs/vr/vr.js',
        'libs/vr/OculusRiftControls.js',
        'libs/vr/OculusRiftEffect.js',
        'libs/video-js-4.4.3/video.js'
    ],
    videovr = [
        'src/shared/js/videovr.vr.js',
        'src/shared/js/videovr.pointerLock.js',
        'src/shared/js/videovr.menu.js',
        'src/shared/js/videovr.js'

    ],
    content = [
        'src/shared/js/content.js'
    ];

function bundle(name, scripts) {
    return gulp.src(scripts)
        .pipe(concat(name))
        .pipe(gulp.dest('dist/assets/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/assets/'));
};

gulp.task('bundle', function () {
    return bundle('bundle.js', libs.concat(videovr).concat(content));
});

gulp.task('lint', function () {
    var srcFilesGlob = [
        'src/shared/js/**/*.js',
        'src/chrome/*.js',
        'src/firefox/lib/*.js'
    ];
    return gulp.src(srcFilesGlob)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .on('error', function () {
            process.exit(-1);
        });
});

gulp.task('test', function () {
    karma.start({
        browsers: ['Chrome'],
        files: ['node_modules/should/should.min.js']
                .concat(libs)
                .concat(videovr)
                .concat(['test/**/*.js']),
        frameworks: ['mocha'],
        singleRun: true
    }, function (exitCode) {
        process.exit(exitCode);
    });
});

gulp.task('default', ['lint', 'test']);
