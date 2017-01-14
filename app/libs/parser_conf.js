/**
 * parse conf
 */
'use strict';
var oser = require('os');
var url = require('url');
var path = require('path');
var fs = require('fs');
var optimist = require('optimist');
var pathToRegexp = require('path-to-regexp');
var globalSep = /\\/gi;
var r = null;

var Parser = {
	parseConfig: function(req) {
		var argv = optimist.argv;
		var conf = null;
		if (typeof argv.c === 'string') {
			conf = path.resolve(__dirname + '/../', argv.c);
		}else {
			conf = path.resolve(__dirname + '/../conf/main.json');
		}
		if(fs.existsSync(conf)) {
			var content = fs.readFileSync(conf, {
				encoding: 'utf8'
			});
			var routes = null;
			try {
				routes = JSON.parse(content);
				return routes;
			}catch(e) {
				console.log('parse conf file failed, ', e.message);
			}
		}
	},
	findProxyUrl: function (req, api) {
		if (r == null) {
			r = this.parseConfig(req);
		}
		var win32 = oser.platform().indexOf('win') != -1;
		if (r) {
			var routes = r.routes;
			for (var i = 0, len = routes.length; i<len; i++) {
				var item = routes[i];
				var pattern = path.join(item.ns, item.path);
				if (win32) {
					pattern = pattern.replace(globalSep, "/");
				}
				var ptn = pathToRegexp(pattern);
				var match = ptn.exec(api);
				if (match) {
					if (typeof item.ws.protocol == 'undefined')
						item.ws.protocol = 'http';
					return url.format(item.ws);
				}
			}
		}
		return null;
	}
}
exports = module.exports = Parser;