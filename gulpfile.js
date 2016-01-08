var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs');

gulp.task('test', function(){
    return gulp.src('./test/*.js')
    .pipe(istanbul({includeUntested: true}))
    .on('finish', function(){
        gulp.src('./test/*.js')
            .pipe(mocha({report: 'spec'}))
            .pipe(istanbul.writeReports({
                dir: './test/unit-tests',
                reporters: ['lcov'],
                reportOpts: { dir: './test/unit.tests'}
            }));
    });
});

gulp.task('checking', function(){
    gulp.src(['./server.js', './config/*.js', './app/*.js', './app/models/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});

gulp.task('jsStyle', function(){
    gulp.src(['./server.js', './config/*.js', './app/*.js', './app/models/*.js'])
        .pipe(jscs())
        .pipe(jscs.reporter());
});

gulp.task('watch', function(){
    gulp.watch(['./server.js', './config/*.js', './app/*.js', './app/models/*.js'], ['checking']);
});