'use strict';
const cfg = global.cfg;
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const rjs = require('requirejs');
const gulpIf = require('gulp-if');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const gulpFilter = require('gulp-filter');
const requirejsOptimize = require('gulp-requirejs-optimize');

/*
 * 获取require配置,返回对象
 * @return object {}
*/
var getRequireCfg = function() {
	let filePath = path.resolve(cfg.path.cwd, cfg.appPath + cfg.path.requireConfig),
		fileContent, result;
	if(!fs.existsSync(filePath)) {
		return result;
	}
	fileContent = fs.readFileSync(filePath, 'UTF-8');
	try{
		result = new Function("var output," + 
			"requirejs = require = function() {}," +
			"define = function() {};" +
			"require.config = function(options) {output = options};" +
			fileContent + ";" +
			"return output;") ()
	} catch(err){
		console.log(err);
	}
	result.baseUrl = path.resolve(cfg.path.app, cfg.distPath) + result.baseUrl;
	return result;
}
var gulpJavascript = function() {
	let modRequireCfg = getRequireCfg();
	let baseUrl = modRequireCfg.baseUrl.replace('../..','');
	let distPath = cfg.distPath + 'static/js/**/*.js';
	let jsFilter = gulpFilter(['!**/*.min.js','!**/*-min.js'], {restore: true});
	if(cfg.options.isProduction) {
		if(modRequireCfg) {
			return gulp.src(distPath)
					   .pipe(plumber())
					   .pipe(jsFilter)
					   .pipe(requirejsOptimize(function(file) {
					   		return {
					   			name: file.path,
					   			baseUrl: baseUrl,
					   			urlArgs: modRequireCfg.urlArgs,
					   			paths: modRequireCfg.paths,
					   			shim: modRequireCfg.shim
					   		}
					   }))
					   .pipe(jsFilter.restore)
					   .pipe(uglify())
					   .pipe(gulp.dest(cfg.dist.js))
		}
	}else if(cfg.options.isDevelopment) {
		return gulp.src(cfg.src.js)
				   .pipe(plumber())
				   .pipe(gulp.dest(cfg.dist.js))
	}else {
		throw new Error('请输入当前开发环境,--env=production or --env=development');
	}
}
module.exports = gulpJavascript;