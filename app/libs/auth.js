/**
 * auth middleware
 */
var urlM = require('url');
var util = require('util');
var httpUtil = require('./http_util.js');
//定义需要加密路由
const URL_NEED_AUTH = [
	/\/index\/*/i
];
/**
 * where to heading for if usr had not been authed
 */
const URL_SIGN = '/';
/**
 * path match
 */
var pathMatch = function(url) {
	var urlComp = urlM.parse(url);
	for(var i = 0, len = URL_NEED_AUTH.length; i < len; i++) {
		var u = URL_NEED_AUTH[i];
		if(u.test(urlComp.pathname)) {
			return true;
		}
	}
	return false;
}
var authFn = function(req, res, next) {
	var acquired = false;
	if(false || typeof req.cookies.node_session === 'string') {
		var credential = httpUtil.decryptCridential(req.cookies.node_session);
		var userId = req.cookies.user;
		var userStr = JSON.stringify({uid: userId});
			userStr = userStr.substring(1).replace('}', '');
		var userSigned = credential && (credential.indexOf(userStr) != -1);
		console.warn('*******************user has been signed %s: %s', userStr, userSigned);
		if(userSigned) {
			acquired = true;
		}else  {
			var expireDate = new Date();
			expireDate.setDate(expireDate.getDate() - 7);
			res.cookie('user', '', {expires: expireDate, httpOnly: true});
			res.cookie('node_session', '', { expires: expireDate, httpOnly: true });
			res.cookie('nickname', '', { expires: expireDate, httpOnly: true });
		}
	}
	var current = req.url;
	acquired = (typeof req.cookies.sessionid === 'string') && req.cookies.sessionid.length > 0;
	if(pathMatch(current) && !acquired) {
		var host = req.headers['host'] || req.headers['Host'] || '';
		if (host.length == 0) {
			res.json({error:10, msg: '无法读取host信息'});
			return;
		}
		var next = "http://" + host + current;
		var signin = util.format(URL_SIGN, encodeURIComponent(next));
		res.redirect(signin);
		return;
	}
	next();
}
exports = module.exports = authFn;