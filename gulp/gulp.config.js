'use strict';

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

// 文件路径
let _path = exports.path = {
	app: './',
	dist: './dist/',
	cwd: path.resolve('./'),
	base: path.resolve('./'),
	requireConfig: 'static/js/require.config.js'
}


// 获取命令行参数
let options = exports.options = getArgv();

//获取基本路径
let appPath = exports.appPath = _path.app + options.mod + '/';
let distPath = exports.distPath = _path.dist + options.mod + '/';

// 浏览器添加前缀
exports.autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

// src 路径
exports.src = Object.assign({}, {
	pages: `${appPath}pages/**/*.jade`,
	js: `${appPath}static/js/**/*.js`,
	css: `${appPath}static/sass/*.scss`,
	images: `${appPath}static/images/*`
});
exports.dist = Object.assign({}, {
	pages: `${distPath}html/`,
	css: `${distPath}static/css/`,
	js: `${distPath}static/js/`,
	images: `${distPath}static/images/`,
	rev: `${distPath}rev/`
})


/*
 * 获取命令行信息
 * @ return {Object} 参数对象
 */

function getArgv() {
	let options = minimist(process.argv.slice(2), {
		string: ['mod','env'],
		boolean: ['hash'],
		default: {
			env: process.env.ENV || 'dev',
			mod: null,
			hash: true
		}
	});
	options.isDevelopment = (options.env == 'dev');
	options.isProduction = (options.env == 'pro');
	if(!options.mod) {
		throw new Error('请输入业务名称，例如: gulp watch --mod=xxx 或 gulp build --mod=xxx --env=production');
	}
	return options;
}