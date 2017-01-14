'use strict';
const cfg = global.cfg;
const gulp = require('gulp');
const untar = require('gulp-untar');
const gunzip = require('gulp-gunzip');
const plumber = require('gulp-plumber');

/*
 * 解压部署文件
 */

var gulpDeploy = function() {
	let tarPath = cfg.appPath + 'output.tar.gz';
}

module.exports = gulpDeploy;