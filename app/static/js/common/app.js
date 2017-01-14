/*
 * @use 模板模式
 * @anthor:liya;
 * @email:liya@51talk.com; (liya3719@vip.qq.com)
 * @date:2016-11-29;
 */
define([
	], function () {
		var App = function () {};
		App.prototype = {
			onPreRun: function () {
			},
			onPostRun: function () {
			},
			onRun : function () {
			},
			run : function () {
				this.onPreRun();
				this.onRun();
				this.onPostRun();
			},
		};
	return App;
});