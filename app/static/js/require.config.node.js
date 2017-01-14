// this version variable is here for
// new md5 file according to this version
var BUILD_VERSION = 3;
// boot up instruction
var requireConfObj = null;
requirejs.config(requireConfObj = {
    baseUrl: "/js/",
    urlArgs: "version=" + (new Date().getTime()),
    paths: {
        jquery: ["libs/jquery"],
        validat: ["plugin/validat"],
        validRule: ["plugin/validRule"],
	    "index/app": ["index/app"],
	},
    shim: {
        jquery: {
            exports: "$"
        }
    },
    onError: function (err) {
        console.log(err.requireType + " type error");
        if (err.requireType === "timeout") {
            console.log('modules: ' + err.requireModules);
        }
    }
});

/**
 * enable capability of console on IE(<9)
 */
if (typeof console == 'undefined') {
    var console = {
        log: function () {},
        warn: function () {},
        debug: function () {},
        error: function () {}
    }
}
if (!''.trim) {
    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }
}
/**
 * require common lib
 */
require(["common/route", "jquery"], function (route) {
	// runtime inject dependencies
	if (typeof globalDeps != 'undefined') {
		_.each(globalDeps, function (v, k) {
			requireConfObj.paths[k] = v;
		});
		requirejs.config(requireConfObj);
		console.log('final paths=', requireConfObj);
	}

    var target = location.pathname;
    var match = null,
        re = null;
    for (var key in route.route) {
        re = new RegExp("^" + key + "$", "gi");
        if (re.test(target)) {
            match = route.route[key];
            break;
        }
    }
    if (!match && (target = location.search.substring(1))) {
        for (var route in route.route) {
            re = new RegExp("^" + route + "$", "gi");
            if (re.test(target)) {
                match = route.route[route];
                break;
            }
        }
    }
    if (!match) {
        match = route.defaultRoute;
        console.warn("default route was used");
    }
    if ($.type(match) === "string") {
        match = [match];
    }
    require(match);
});
