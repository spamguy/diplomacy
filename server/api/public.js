module.exports = (function() {
	var hashOptions = {
		'DEFAULT_HASH_ITERATIONS': 16000,
		'SALT_SIZE': 64,
		'KEY_LENGTH': 128
	};
	
	var express = require('express');
	var app = express();
	var models = require('../models');
	var pbkdf2 = require('easy-pbkdf2')(hashOptions);
	
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