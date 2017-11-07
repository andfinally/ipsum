'use strict';

const gulp = require('gulp'),
	babelify = require('babelify'),
	runSequence = require('run-sequence'),
	rename = require('gulp-rename'),
	replace = require('gulp-regex-replace'),
	sourcemaps = require('gulp-sourcemaps'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	cleanCSS = require('gulp-clean-css'),
	del = require('del');

// Increments timestamp for cachebusting
gulp.task('build-timestamp', function() {
	gulp.src('html/lib/build-timestamp.template')
		.pipe(replace({regex: 'timestamp_placeholder', replace: Date.now()}))
		.pipe(rename(function(path) {
			path.extname = '.php'
		}))
		.pipe(gulp.dest('html/lib'))
});

// Transpiles ipsum.es to ipsum.js
gulp.task('browserify', function() {
	var bundler = browserify('html/js/ipsum.es');
	bundler.transform(babelify, {sourceMaps: true});
	return bundler.bundle()
		.on('error', function(err) {
			console.error(err);
		})
		.pipe(source('ipsum.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('html/js'));
});

// This task runs browserify first
// Bundles ipsum.js with jQuery and rangeSlider and minifies
gulp.task('js', ['browserify'], () => {
	return del([
		'html/js/app.js',
		'html/js/app.min.js'
	]).then((paths) => {
		gulp.src(['html/js/jquery-3.2.1.js', 'html/js/ion.rangeSlider.js', 'html/js/ipsum.js'])
			.pipe(concat('app.js'))
			.pipe(gulp.dest('html/js'))
			.pipe(rename('app.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest('html/js'));
	})
});

gulp.task('css', () => {
	gulp.src(['html/css/normalize.css', 'html/css/ion.rangeSlider.css', 'html/css/ion.rangeSlider.skinHTML5.css', 'html/css/ipsum.css'])
		.pipe(concat('styles.css'))
		.pipe(gulp.dest('html/css'))
		.pipe(rename('styles.min.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest('html/css'));
})

gulp.task('watch-css', () => {
	return gulp.watch(['html/**/ipsum.css'], ['css']);
});

gulp.task('watch-js', () => {
	return gulp.watch(['html/**/ipsum.es'], ['js']);
})

gulp.task('watch', ['watch-css', 'watch-js', 'build-timestamp']);

gulp.task('default', ['css', 'js']);
