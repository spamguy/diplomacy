module.exports = (function() {	
	var express = require('express');
	var app = express();
	var models = require('../models');
	
	app.get('/users/:username/exists', function(req, res) {
		var username = req.param('username');
		
		models.User
			.count({ where: ["lower(username) = ?", username] })
			.success(function(c) {
				res.json({ exists: c === 1 });
			});
	});
	
	return app;
}());