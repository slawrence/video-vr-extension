var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    scripts = [
        'libs/three.js',
        'libs/PointerLockControls.js',
        'libs/vr/vr.js',
        'libs/vr/OculusRiftControls.js',
        'libs/vr/OculusRiftEffect.js',
        'libs/video-js-4.4.3/video.js',
        'src/shared/js/videovr.vr.js',
        'src/shared/js/videovr.pointerLock.js',
        'src/shared/js/videovr.menu.js',
        'src/shared/js/videovr.js',
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
    return bundle('bundle.js', scripts);
});
