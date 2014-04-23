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
        'src/shared/js/make3d.js',
        'src/shared/js/content.js'
    ];

function bundle(name, scripts) {
    return gulp.src(scripts)
        .pipe(concat(name))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/assets/'));
};

gulp.task('bundle', function () {
    return bundle('bundle.js', scripts);
});
