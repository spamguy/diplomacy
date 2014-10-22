module.exports = (function() {
	var express = require('express');
	var app = express();
	
	app.get('/users', function(req, res) {
		res.json([]);
	});
	
	return app;
}());