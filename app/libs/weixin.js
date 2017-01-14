/**
 * share utilities calling weixin api
 */
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var request = require('request');
var urler = require('url');
var querystring = require('querystring');

// weixin config
// change it to other conf
const APP_ID = 'wx6720e358b1ec0e63';
const APP_SECRET = '19b129c12ea836f9578afaa71ad6271b';

const ERR_ACCESS_TOKEN = 1;
const ERR_API_TICKET = 2;

/***
 * weixin utility
 */
var Weixin = {
	_mConf: null,
	getRandomBytes: function (width) {
		if (typeof width !== 'number')
			width = 0;
		if (width == 0)
			return '';
		else if (width < 0)
			throw new TypeError('width is requred to be numeric type');
		var buf = crypto.randomBytes(width);
		return buf.toString('hex');
	},
	signature: function (opts) {
		if (typeof opts == 'object' && opts != null && !Array.isArray(opts)) {
			if (typeof opts.url !== 'string') {
				throw new Error('url is required in opts');
			} else if (typeof opts.nonceStr !== 'string') {
				throw new Error('nonceStr is required in opts');
			} else if (typeof opts.jsapi_ticket !== 'string') {
				throw new Error('jsapi ticket is required in opts');
			} else if (typeof opts.timestamp !== 'number') {
				throw new Error('timestamp ticket is required in opts');
			}

			var buf = [];
			buf.push('jsapi_ticket=' + opts.jsapi_ticket);
			buf.push('noncestr=' + opts.nonceStr);
			buf.push('timestamp=' + opts.timestamp);
			buf.push('url=' + opts.url);

			var sha1 = crypto.createHash('sha1');
			sha1.update(buf.join('&'));
			return sha1.digest('hex');
		} else {
			throw new Error('illegal arguments opts');
		}
	},
	getConfFile: function () {
		var file = path.join(__dirname, 'weixin.json');
		return file;
	},
	_readConf: function () {
		var file = this.getConfFile();
		if (!fs.existsSync(file)) {
			this._mConf = {};
		} else {
			var conf = fs.readFileSync(file, 'utf8');
			this._mConf = JSON.parse(conf);
		}
	},
	_save: function () {
		var file = this.getConfFile();
		fs.writeFileSync(file, JSON.stringify(this._mConf), 'utf8');
	},
	_tokenExpired: function (now) {
		if (typeof this._mConf.access_token == 'undefined')
			return true;
		var token = this._mConf.access_token;
		var expiredIn = token.expires_in;
		var capture = token.capture;
        //console.log(">>>>>", now, ':', capture);
		if (now > capture + expiredIn * 1000)
			return true;
		return false;
	},
	_ticketExpired: function (now) {
		var ticket = this._mConf.ticket;
		if (typeof ticket == 'undefined')
			return true;

		var expiredIn = ticket.expires_in;
		var capture = ticket.capture;

		if (now > capture + expiredIn * 1000)
			return true;
		return false;
	},
	_readApiTicket: function (now, url, callback) {
		if (this._ticketExpired(now)) {
			var accessToken = this._mConf.access_token.access_token;
			var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+accessToken+'&type=jsapi';
			console.log('before send request to %s', url);
			var _this = this;
			request(url, function (err, resp, body) {
				if (!err && resp.statusCode >= 200 && resp.statusCode < 300) {
					var result = JSON.parse(body);
					if (result && result.errcode == 0) {
						result.capture = now;
						_this._mConf.ticket = result;

						_this._finalCall(now, url, callback);
						return;
					} else if (result && result.errcode != 0) {
						console.error('weixin ticket error: %d', result.errcode);
					}
				}
				// save middle production if encountering exception
				this._save();
				if (typeof callback == 'function') {
					console.log('stop the world %d', ERR_API_TICKET);
					callback.call(_this, ERR_API_TICKET);
				}
			});
		} else {
			this._finalCall(now, url, callback);
		}
	},
	_finalCall: function (now, url, callback) {
		this._save();
		this._writeCallback(now, url, callback);
	},
	_writeCallback: function (now, url, callback) {
		var nonce = this.getRandomBytes(6);
		var secNow = parseInt(now / 1000);
		var opt = {
			nonceStr: nonce,
			jsapi_ticket: this._mConf.ticket.ticket,
			timestamp: secNow,
			url: url,
		};
		var sign = this.signature(opt);
		opt.signature = sign;
        opt.appId = APP_ID;
		if (typeof callback == 'function') {
			callback.call(this, 0/** no error **/, opt);
		}
	},
	_readAccessToken: function (now, url, callback) {
		var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+APP_ID+'&secret=' + APP_SECRET;
		var _this = this;
		console.log('before send request to %s', url);
		request(url, function (err, resp, body) {
			if (!err && resp.statusCode >= 200 && resp.statusCode < 300) {
				var result = JSON.parse(body);
				if (result && typeof result.access_token != 'undefined') {
					result.capture = now;
					_this._mConf.access_token = result;
					_this._readApiTicket(now, url, callback);
					return;
				} else if (result && typeof result.errcode != 'undefined') {
					console.error('weixin api error: %d', result.errcode);
				}
			}
			if (typeof callback == 'function') {
				console.log('stop the world %d', ERR_ACCESS_TOKEN);
				callback.call(_this, ERR_ACCESS_TOKEN);
			}
		});
	},
	use: function (url, callback) {
		if (typeof url !== 'string') {
			throw new TypeError('url is required to complete the signing');
		}
		var now = new Date().getTime();
		if (!this._mConf) {
			this._readConf();
		}
		if (this._tokenExpired(now)) {
			console.log('before start to read access_token');
			this._readAccessToken(now, url, callback);
		} else {
			this._readApiTicket(now, url, callback);
		}
	},
	currentUrl: function(req, https) {
		var host = req.headers['host'];
		var url = req.url;
        return (https===true?'https':'http') + "://" + host + url;
        /*
		return urler.format({
			protocol: https===true?'https':'http',
			hostname: host,
			pathname: url,
			query: req.querys,
		});
        */
	}
}

/**
 * use AMD style exporting
 */
exports = module.exports = Weixin;
