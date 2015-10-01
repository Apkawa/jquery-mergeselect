'use strict';
var _ = require('lodash'),
    gulp = require('gulp'),
    connect = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    watch = require('gulp-watch'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    less = require('gulp-less'),
    cssBase64 = require('gulp-css-base64'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    processhtml = require('gulp-processhtml'),
    preprocess = require('gulp-preprocess'),
    open = require('gulp-open')
    ;

var config = {
    source_dir: './src/',
    dest_dir: './dist/',
    jquery: './bower_components/jquery/dist/'
};

config = _.extend(config, {
    images: {
        src: config.source_dir + 'images/',
        dest: config.dest_dir + 'images/'
    },
    style: {
        src: config.source_dir + 'styles/',
        dest: config.dest_dir + 'css/',
    },
    js: {
        src: config.source_dir,
        dest: config.dest_dir,
    }


});

gulp.task('image', function () {
    gulp.src(config.images.src + '*')
        .pipe(gulp.dest(config.images.dest))
});

gulp.task('js', function () {
    gulp.src(config.js.src + '*.js')
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.js.dest))
});

gulp.task('less', function () {
    gulp.src(config.style.src + '*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(cssBase64({
                baseDir: config.source_dir
            }
        ))
        .pipe(autoprefixer('last 1 version', '> 1%', 'ie 8', 'ie 7'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.style.dest))

});

gulp.task('html', function () {
    gulp.src(config.source_dir + '*.html')
        .pipe(gulp.dest(config.dest_dir))

});

gulp.task('compress', ['default'], function () {
    gulp.src(config.js.dest + '*.js')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.js.dest));

    gulp.src(config.style.dest + '*.css')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(csso())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.style.dest));

    gulp.src(config.source_dir + '*.html')
        .pipe(processhtml())
        .pipe(gulp.dest(config.dest_dir))
});


gulp.task('lint', function () {
    return gulp.src([config.js.src + '*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('default', ['less', 'js', 'image', 'html']);




gulp.task('runserver', function () {
    connect.server({
        root: [config.dest_dir, config.jquery],
        livereload: true
    });
});
gulp.task('runserver_reload', function () {
    connect.reload();
    //livereload()
});

gulp.task('watch', ['runserver', 'default'], function () {
    gulp.watch(config.style.src + '*.less', ['less', 'runserver_reload']);
    gulp.watch(config.js.src + '*.js', ['js', 'runserver_reload']);
    gulp.watch(config.source_dir + '*.html', ['html', 'runserver_reload']);
});