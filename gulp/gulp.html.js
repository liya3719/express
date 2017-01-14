'use strict';
const cfg = global.cfg;
const gulp = require('gulp');
const gulpClean = require('gulp-clean');
const plumber = require('gulp-plumber');
const revCollector = require('gulp-rev-collector');

var gulpHtml = function() {
	let distPath = cfg.dist.pages + '**/*.html';
	let revFile = cfg.dist.rev + '**/*.json';
	if(cfg.options.isProduction) {
		return gulp.src([revFile, distPath])
			.pipe(plumber())
			.pipe(gulp.dest(cfg.dist.pages))
	} else if(cfg.options.isDevelopment) {
		return gulp.src([revFile, distPath])
			.pipe(plumber())
			.pipe(revCollector({
				replaceReved: true
			}))
			.pipe(gulp.dest(cfg.dist.pages))
	} else {
		throw new Error('请输入当前开发环境,--env=production');
	}
}
module.exports = gulpHtml;