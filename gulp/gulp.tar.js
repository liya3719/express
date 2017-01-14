'use strict';
const cfg = global.cfg;
const gulp = require('gulp');
const tar = require('gulp-tar');
const gzip = require('gulp-gzip');
const plumber = require('gulp-plumber');

/*
 * 打包生成tar.gz文件
 */
var gulpTar = function() {
	// 打包的文件目录
	let buildPath = cfg.distPath;
	// 打包输入目录
	let distPath = cfg.appPath;
	return gulp.src(buildPath)
			   .pipe(plumber())
			   .pipe(tar('output.tar'))
			   .pipe(gzip())
			   .pipe(gulp.dest(distPath))
}

module.exports = gulpTar;