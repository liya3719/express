require(['common/app'], function(Application) {
	var App = function() {
		Application.call(this);
	}
	$.extend(App.prototype, Application.prototype, {
		onRun: function() {
			console.log('onRun')
		}
	});
	var app = new App();
	app.run();
});