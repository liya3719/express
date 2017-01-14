require.config({
	baseUrl: "../../static/js/",
	urlArgs: "version=" + (new Date().getTime()),
	paths: {
		jquery: ["libs/jquery"],
		"index/app": ["index/app"]
	},
	shim :{
		jquery:{
			exports: '$'
		}
	},
	onError: function (err) {
        console.log(err.requireType + " type error");
        if (err.requireType === "timeout") {
            console.log('modules: ' + err.requireModules);
        }
    }
});
require(["common/route","jquery"], function(route) {
	var match = null,
		re = null;
	var dataInit = $('div').attr('data-init');
	for(var key in route.route) {
		re = new RegExp("^" + key + "$", "gi");
		if(re.test(dataInit)) {
			match = route.route[key];
			break;
		}
	}
	if(!match) {
		match = route.defaultRoute;
		console.log('default route was used');
	}
	if(typeof match === 'string') {
		match = [match];
	}
	require(match)
})