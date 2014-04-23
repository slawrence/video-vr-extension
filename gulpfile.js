var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    mainScripts = [
        'libs/three.js',
        'libs/PointerLockControls.js',
        'libs/vr/vr.js',
        'libs/vr/OculusRiftControls.js',
        'libs/vr/OculusRiftEffect.js',
        'src/shared/js/make3d.js'
    ];

function bundle(name, scripts) {
    return gulp.src(scripts)
        .pipe(concat(name))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/assets/'));
};
gulp.task('bundle-chrome', function () {
    return bundle('bundle-chrome.js', mainScripts);
});

gulp.task('bundle-firefox', function () {
    var scripts = mainScripts.concat('src/firefox/data/content.js');
    return bundle('bundle-firefox.js', scripts);
});
