'use strict';
const gulp = require('gulp');
const gulpSequence = require('gulp-sequence').use(gulp);
const browserSync = require('browser-sync');
const cfg = global.cfg = require('./gulp/gulp.config');
const gulpClean = require('./gulp/gulp.clean');
const gulpJade = require('./gulp/gulp.jade');
const gulpHtml = require('./gulp/gulp.html');
const gulpCss = require('./gulp/gulp.css');
const gulpJavascript = require('./gulp/gulp.javascript');
const gulpImages = require('./gulp/gulp.image');

//清除build目录
// gulp.task('clean', () => gulpClean());
//编译js文件
gulp.task('build:js', () => gulpJavascript());
//编译sass文件
gulp.task('build:css', () => gulpCss());
//编译jade文件 isDevelopment html处理
gulp.task('build:jade', () => gulpJade());
//isProduction html处理
gulp.task('build:html', () => gulpHtml());
//处理图片
gulp.task('build:images', () => gulpImages());
/*
 * build (npm run build)
 * @use gulp build [option]
 *      gulp build --mod=模块名称 --env生产环境编译模式
 */
gulp.task('build', gulpSequence('build:css', 'build:js', 'build:images', 'build:html'));

/*
 * browser-sync
 */

gulp.task('browser-sync', function() {
	browserSync({
		logPrefix: "NorthAmerica Project",
		server: {
			baseDir: '.',
			directory: true
		},
		open: 'external',
		startPath:cfg.dist.pages
	})
});
gulp.task('bs-reload', function() {
	browserSync.reload();
});

/*
 * dev (npm run dev)
 * @use gulp dev [option]
 * gulp dev --mod=模块名称 --env开发环境编译模式
 * 未引入node server前使用browserSync
 */

gulp.task('watch', ['browser-sync'], function() {
	gulp.watch([cfg.src.pages], ['build:jade', 'bs-reload']);
	gulp.watch([cfg.src.css], ['build:css', 'bs-reload']);
	gulp.watch([cfg.src.js], ['build:js', 'bs-reload']);
	gulp.watch([cfg.src.images], ['build:images', 'bs-reload']);
})
