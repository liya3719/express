/**
 * requirements
 */
var util = require('util');
var merge = require('merge');
var qr = require('qr-image');
var express = require('express');
var router = express.Router();
var querystring = require('querystring');

var handler = function(app) {
	router.get('/', function(req, res, next) {
		app.set('view engine','jade');
		var data = JSON.parse(res._proxyLine.data);
		res.render('index', {
			title: 'index',
			data: data
		});
	});
	router.get('/detail/', function(req, res, next) {
		app.set('view engine','jade');
		var data = JSON.parse(res._proxyLine.data);
		res.render('detail', {
			title: 'detail',
			data: data
		});
	});
	router.get('/create_qrcode', function(req, res, next) {
		var text = req.query.text;
		console.log(text);
		try {
	        var img = qr.image(text,{size :10});
	        res.writeHead(200, {'Content-Type': 'image/png'});
	        img.pipe(res);
	    } catch (e) {
	        res.writeHead(414, {'Content-Type': 'text/html'});
	        res.end('<h1>414 Request-URI Too Large</h1>');
	    }
	})
	router.get('/weixin',function(req, res, next){
		app.set('view engine','jade');
        var weixin = require('../libs/weixin');
        var current = weixin.currentUrl(req);
        console.log("sign url", current);
        weixin.use(current, function (err, data) {
            res.render('weixin', data);
        });
	});
	return router;
};
module.exports = handler;
