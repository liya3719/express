/**
 * http utility
 */
'use strict';
var crypto = require('crypto');
var KEY = 'mHxZkHLTalk';
var httpUtil = {
	// 处理页面渲染数据get请求
	respond: function(res) {
		var proxy = res._proxyLine;
		if(proxy.error) {
			if (typeof proxy.data == 'string' && proxy.data.trim().length > 0) {
				proxy.data = JSON.parse(proxy.data);
			}
			res.json(proxy);
		} else {
			var data = JSON.parse(proxy.data);
			proxy.data = data;
			res.json(proxy);
		}
	},
	//读取本地mock数据
	loadAlphaData: function(req, resp, fileName) {
		var path = require('path');
		//查找mock数据路径
		var alphaDataFile = path.resolve(__dirname+'/../alpha', fileName);
		var fs = require('fs');
		//判断该文件是否存在,如果存在则读取里面数据,否则抛出错误
		if(fs.existsSync(alphaDataFile)) {
			var dataContent = fs.readFileSync(alphaDataFile, 'utf8');
			resp.json(JSON.parse(dataContent));
		}else {
			resp.json({
				error: -9999,
				message: 'alpha test file do not exists, do you forgot to place '+fileName+'under alpha directory'
			})
		}
	},
	//打印日志
	logFailure: function(url, res, body, param) {
		if(res.statusCode != 200) {
			console.log('\n\n\n\n----------------------------------------------------------');
			console.log('request url: ' + url);
			console.log('status: '+ res.statusCode);
			console.log('headers: ' + JSON.stringify(res.headers));
			console.log('form data: ' + JSON.stringify(params));
			console.log('data: ' + body);
			console.log('----------------------------------------------------------\n\n\n\n');
		}
	},
	encryptCridential: function (obj) {
		if (!obj || typeof obj.uid!== 'string') {
			return null;
		}
		var key = new Buffer(KEY, 'utf8');
		var secureInfo = JSON.stringify(obj);
		var cipher = crypto.createCipheriv('aes-128-ecb', key, '');
		var encrypted = [];
		encrypted.push(cipher.update(secureInfo, 'utf8', 'hex'));
		encrypted.push(cipher.final('hex'));
		var secureCreditial = encrypted.join('');
		return secureCreditial;
	},
	decryptCridential: function (encrypted) {
		var key = new Buffer(KEY, 'utf8');
		var decipher = crypto.createDecipheriv('aes-128-ecb', key, '');
		var decode = [];
		decode.push(decipher.update(encrypted, 'hex', 'utf8'));
		decode.push(decipher.update('utf8'));
		var decodeCreditial = decode.join('');
		console.log('decrypted str %s', decodeCreditial);
		return decodeCreditial;
	},
	//处理post请求
	sendPostRequest: function(request, req, res, url, data) {
		request.post({
			url: url,
			form: data,
			headers: {
				cookie: req.headers.cookie
			}
		}, function(err, httpResponse, body) {
			httpUtil.logFailure(url, res, body, data);
			if(err) {
				res.json({
					error: 1,
					message: err.message
				});
				return;
			}
			var data = JSON.parse(body);
			var done = httpResponse.statusCode >= 200 && httpResponse.statusCode < 300;
			data.error = done ? 0 : httpResponse.statusCode;
			res.json(data);
		})
	}
};
exports = module.exports = httpUtil;