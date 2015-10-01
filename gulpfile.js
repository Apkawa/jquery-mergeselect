'use strict';
var path = require('path'),
    gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    browserify = require('gulp-browserify'),
    connect = require('gulp-connect'),
    cors = require('cors')
    ;

var name = 'widget_v2';
var config = {
    scripts: "./app/*.js",
    less: "./app/styles/*.less",
    html: "./app/*.html",
    dest: './dist/',
};

gulp.task('connect', function () {
    connect.server({
        root: config.dest,
        livereload: true,
        middleware: function () {
            return [cors()];
        }
    });
});

gulp.task('production', function () {
    // place code for your default task here
    var min_filename = path.basename(value, path.extname(value)) + '.min.js';
    gulp.src(config.scripts)
        .pipe(rename(min_filename + ".min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(config.dest))
});



gulp.task('html', function () {
    gulp.src('./app/*.html')
        .pipe(gulp.dest(config.dest))
        .pipe(connect.reload())
    ;
});

gulp.task('js', function () {
    gulp.src(config.scripts)
        .pipe(browserify({
                debug: true,
                extensions: ['.js']
            }
        ))
        .pipe(gulp.dest(config.dest))
        .pipe(connect.reload())
    ;
});

gulp.task('default', ['js', 'html']);

gulp.task('watch', ['connect', 'default'], function () {
    gulp.watch(config.scripts, ['js']);
    gulp.watch(config.html, ['html']);
});

