/**
 * [express description]
 * @type {[type]}
 */
var express = require('express');
var router = express.Router();
var util = require('util');
var httpUtil = require('../libs/http_util');
var confParser = require('../libs/parser_conf');
var request = require('request');
var handler = function(app) {
	router.get('/', function(req, res, next) {
		httpUtil.respond(res);
	});
	router.get('/detail/', function(req, res, next) {
		httpUtil.respond(res);
	});
	router.post('/buy/', function (req, res, next) {
		// usr account info in post
		var ps_tid = req.body.ps_tid;
		var data = {
			ps_tid: ps_tid
		}
		// the write url
		// is indentical to query url
		var url = confParser.findProxyUrl(req, '/api/buy/');
		// send post
		httpUtil.sendPostRequest(request, req, res, url, data);
	});
	return router;
}
module.exports = handler;