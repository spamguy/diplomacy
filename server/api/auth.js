module.exports = (function() {
	var hashOptions = {
		'DEFAULT_HASH_ITERATIONS': 32000,
		'SALT_SIZE': 64,
		'KEY_LENGTH': 128
	};
	
	var express = require('express');
	var app = express();
	var models = require('../models');
	var pbkdf2 = require('easy-pbkdf2')(hashOptions);
	var passport = require('passport');
	var LocalStrategy = require('passport-local').Strategy;
	
	// passport config
	passport.use(new LocalStrategy(
		function(username, password, done) {
			try {
				// find user with matching username
				var maybeUser = models.User
					.find({
						where: { username: username }
				});

				// if no results, stop trying
				if (!maybeUser)
					return done(null, false, { error: 'Invalid username and/or password.' });
				
				// if a match was found, test against the stored hash
				pbkdf2.verify(maybeUser.passwordsalt, maybeUser.password, password, function(err, match) {
					if (match)
						return done(null, maybeUser);
					else if (!match)
						return done(null, false, { error: 'Invalid username and/or password.' });
					else
						return done(err);
				});
			}
			catch (ex) {
				return done('There was a problem authenticating you. Please try again later.');
			}
		})
	);
	
	app.post('/login', function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			if (err) { return next(err); }
			
		});
	});
	
	app.put('/new', function(req, res, next) {
		var salt = pbkdf2.generateSalt();
		pbkdf2.secureHash(req.body.password, salt, function(err, hash, salt) {
			var user = models.User
				.build({
					username: req.body.username,
					password: hash,
					passwordsalt: salt,
					email: req.body.email
				});
			user.save();
		});
	});
		
	return app;
}());