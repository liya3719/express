'use strict';
const cfg = global.cfg;
const gulp = require('gulp');
const base64 = require('gulp-base64');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');

var gulpImages = function() {
	let distPath = cfg.dist.css + '*.css';
	if(cfg.options.isProduction) {
		return gulp.src(distPath)
			.pipe(base64({
	            baseDir: cfg.dist.css,
	            extensions: ['svg', 'png', /\.jpg#datauri$/i],
	            exclude:    [/\.server\.(com|net)\/dynamic\//, '--live.jpg'],
	            maxImageSize: 8 * 1024, // bytes 
	            debug: true
	        }))
	        .pipe(imagemin())
	        .pipe(plumber())
	        .pipe(gulp.dest(cfg.dist.css))
	}else if(cfg.options.isDevelopment) {
		return gulp.src(cfg.src.images)
			.pipe(plumber())
			.pipe(imagemin())
			.pipe(gulp.dest(cfg.dist.images))
	}else {
		throw new Error('输入开发环境, --env=development or --env=production');
	}
}

module.exports = gulpImages;