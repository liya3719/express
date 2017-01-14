'use strict';
const cfg = global.cfg;
const gulp = require('gulp');
const shell = require('gulp-shell');
const plumber = require('gulp-plumber');

var gulpClean = function() {
	return gulp.src(cfg.distPath)
			   .pipe(shell(['rm -rf' +  cfg.distPath]))
}

module.exports = gulpClean;