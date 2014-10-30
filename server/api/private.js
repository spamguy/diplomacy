module.exports = (function() {
	var express = require('express');
	var app = express();
	
	app.get('/games/:id', function(req, res) {
		var id = mongoose.Types.ObjectId(req.param('id'));
		
		return require('../models/game').Game
			.find({ 'players._id': username }, function(err, players) {
				return res.send(players);
			});
	});
	
	return app;
}());