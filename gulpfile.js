// Include gulp
var gulp = require('gulp');

// Include our plugins
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var usemin = require('gulp-usemin');

var appDir = 'app',
  buildDist = './build';

var paths = {
  scripts: [ appDir + '/js/**/*.js'],
  styles: [ appDir + '/sass/**/*.scss']
};

// compress
gulp.task('compress', function() {
  return gulp.src(paths.scripts)
    //.pipe(uglify())
    .pipe(gulp.dest(buildDist + '/js'));
});

// javascript linting
gulp.task('lint', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter());
});

// sass compilation
gulp.task('sass', function () {
  gulp.src(paths.styles)
    .pipe(sass())
    .pipe(gulp.dest(buildDist + '/css'));
});

// default workflow
gulp.task('default', function() {
  gulp.run('sass');
  gulp.run('compress');
  
  gulp.watch(paths.scripts, ['compress']);
  gulp.watch(paths.styles, ['sass']);
});
