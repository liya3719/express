'use strict';
const cfg = global.cfg;
const gulp = require('gulp');
const rev = require('gulp-rev');
const sass = require('gulp-sass');
const filter = require('gulp-filter');
const plumber = require('gulp-plumber');
const cssminify = require('gulp-minify-css');
const autoprefixer =require('gulp-autoprefixer');
const revCollector = require("gulp-rev-collector");
const changedInPlace = require('gulp-changed-in-place');
const makeCssUrlVersion = require('gulp-make-css-url-version');
var gulpCss = function() {
	let distPath = cfg.dist.css + '*.css';
	let filterCss = filter(['**/*.scss', '!mixins/*.scss', '!utilities/*.scss'], {restore: true});
	let revFile = cfg.dist.rev + 'css/*.json';
	if(cfg.options.isProduction) {
		return gulp.src(distPath)
			.pipe(plumber())
			.pipe(gulp.dest(cfg.dist.css))
	}else if(cfg.options.isDevelopment) {
		return gulp.src(cfg.src.css)
			.pipe(filterCss)
			.pipe(sass({
				outputStyle: 'compressed'
			}).on('error', sass.logError))
			.pipe(autoprefixer({
				browsers:cfg.autoPrefixBrowserList
			}))
			.pipe(filterCss.restore)
			.pipe(makeCssUrlVersion())
			.pipe(plumber())
			.pipe(changedInPlace({
				firstPass: true
			}))
			.pipe(gulp.dest(cfg.dist.css))
	}else{
		throw new Error('请输入当前开发环境, --evn=development or --evn=production');
	}
}

module.exports = gulpCss;