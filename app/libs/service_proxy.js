var fs = require('fs');
var oser = require('os');
var url = require('url');
var http = require('http');
var path = require('path');
var util = require('util');
var merge = require('merge');
var log4js = require('log4js');
var logger = log4js.getLogger();
var optimist = require('optimist');
var querystring = require('querystring');
var pathToRegexp = require('path-to-regexp');

var Router = function(conf) {
	this._conf = conf;
}
// no error
Router.ERROR_NO = 0;
// can not found the defined router
Router.ERROR_ROUTER_NOT_FOUND = 1;
// router disabled 
Router.ERROR_ROUTER_DISABLED = 2;
// can not connect to web service endpoint
Router.ERROR_CAN_NOT_CONNECT_TO_WS = 3;
// conf params error
Router.ERROR_ROUTER_PARAM_ERROR = 4;
// the global conf object
Router.globalConf = null;
// for win32 sep
Router.globalSep = /\\/gi;

Router.find = function(req) {
	if(Router.globalConf != null) {
		return Router._match(req, Router.globalConf);
	}
	// 获取配置文件
	var argv = optimist.argv;
	var conf = null;
	if(typeof argv.c == 'string') {
		conf = path.resolve(__dirname + '/../', argv.c);
	} else {
		conf = path.resolve(__dirname + '/../', 'main.json');
	}
	console.warn('using config %s', conf);
	if(fs.existsSync(conf)) {
		var content = fs.readFileSync(conf, {
			encoding: 'utf8'
		});
		var routes = null;
		try{
			routes = JSON.parse(content);
		} catch(e) {
			logger.error('parse conf file failed, ', e.message);
			console.error(e);
		}
		if(routes) {
			Router.globalConf = routes;
			return Router._match(req, routes);
		}
	}
	return null;
}
Router._match = function(req, routes) {
	var routes = routes.routes;
	var targetPath = req._parsedUrl.pathname;
	var win = oser.platform().indexOf('win') != -1;
	for(var i = 0, len = routes.length; i < len; i++) {
		var item = routes[i];
		var pattern = path.join(item.ns, item.path);
		if(win) {
			pattern = pattern.replace(Router.globalSep, '/');
		}
		var ptn = pathToRegexp(pattern);
		var match = ptn.exec(targetPath);
		if (match) {
			if (item.skip === 'on') {
				console.warn('[service_proxy]skip matching pattern as a reason of skip instruction found');
			} else {
				console.log('[service_proxy]found conf pattern ', pattern);
				return item;
			}
		}
	}
}
Router.bindProxyLine = function(resp, data) {
	resp._proxyLine = data;
}
Router.removeQues = function(a) {
	if(typeof a === 'string' && a.indexOf('?') == 0) {
		return a.substring(1);
	}
	return a;
}
Router.prototype = {
	_formatOpts: function(req, resp, next) {
		var requestUrl = url.parse(req.url);
		var conf = this._conf;
		if(requestUrl.search) {
			if(conf.ws.search) {
				var reqSearchStr = Router.removeQues(requestUrl.search);
				var confSearch = Router.removeQues(conf.ws.search);
				var reqSearch = querystring.parse(reqSearchStr);
				var confSearch = querystring.parse(confSearch);
				console.log('confSearch ===>>> %s', JSON.stringify(confSearch));
				console.log('reqSearchStr ===>>> %s', JSON.stringify(reqSearch));
				confSearch = merge(confSearch, reqSearch);
				conf.ws.search = '?' + querystring.stringify(confSearch);
			} else {
				//conf.ws.search = requestUrl.search;
			}
		}
		var opts = merge(conf.ws, {
			protocol: 'http',
			auth: null,
			hash: null,
			method: 'GET'
		});
		var uri = url.format(conf.ws);
		opts = url.parse(uri);
		if(conf.uriHandler) {
			var handler = new Function(conf.uriHandler);
			opts = handler.call({opts: opts, require: require, req: req});
			if(opts.path) {
				//opts.path = opts.pathname + opts.search;
				opts.path = decodeURIComponent(opts.pathname);
			}
		}
		if(!opts.hostname || !opts.pathname) {
			logger.warn('router conf for '+ req.url +" require some param like hostname, pathname");
			Router.bindProxyLine(resp, {
				error: Router.ERROR_ROUTER_PARAM_ERROR
			});
			next();
			return;
		}
		return opts;
	},
	process: function(req, resp, next) {
		var conf = this._conf;
		if(conf.enabled === false) {
			Router.bindProxyLine(resp, {
				error: Router.ERROR_ROUTER_DISABLED
			});
			next();
		} else {
			var opts = this._formatOpts(req, resp, next);
			var hs = merge(req.headers, {});
			var cookies = req.headers.cookie;
			if(cookies) {
				console.log('cookies:=====>>> %s', cookies);
				opts.headers = {
					cookie: cookies
				}
			};
			logger.info('['+req.url+']send request to '+ url.format(opts));
			var request = http.request(opts, function(res) {
				res.setEncoding('utf8');
				var data = '';
				res.on('data', function(chunk) {
					data += chunk;
				});
				res.on('end', function() {
					var conf = Router.globalConf;
					if(res.statusCode != 200) {
						logger.debug('\n\n\n\n----------------------------------------------------------');
						logger.debug('request url: ' + url.format(opts));
						logger.debug('status: '+ res.statusCode);
						logger.debug('headers: ' + JSON.stringify(res.headers));
						logger.debug('data: ' + data);
						logger.debug('----------------------------------------------------------\n\n\n\n');
					}
					if(conf.debug == 'on') {
						try {
								logger.info("\nproxy line:\n\n" + util.inspect(JSON.parse(data), {depth:null}));
							} catch (e) {
						}
					}
					var err = res.statusCode >= 200 && res.statusCode < 300 ? Router.ERROR_NO : res.statusCode;
					Router.bindProxyLine(resp, {
						error: err,
						data: data,
						params: (typeof opts.search == 'string') ? querystring.parse(opts.search.substring(1)) : {}
					});
					var cookieStr = req.header['set-cookie'];
					//if(cookieStr && cookieStr.length > 0) {
						// write cookie
						// var cookies = cookieStr.split(';');
						// resp.setHeader('Set-Cookie', cookieStr);
					//}
					next();
				});
			});
			request.on('error', function(e) {
				Router.bindProxyLine(resp, {
					error: Router.ERROR_CAN_NOT_CONNECT_TO_WS
				});
				next();
			});
			request.write("\n");
			request.end();
		}
	}
}
/**
 * according to every single view rendering 
 * we pair it with an api call
 */
var proxy = function(req, resp, next) {
	var conf = Router.find(req);
	var data = Object.create(null);
	if(!conf) {
		data.error = Router.ERROR_ROUTER_NOT_FOUND;
		logger.warn('can not found router definition for ' + req.url);
		Router.bindProxyLine(data);
		next();
	} else {
		var router = new Router(conf);
		router.process(req, resp, next);
	}
}
exports = module.exports = proxy;