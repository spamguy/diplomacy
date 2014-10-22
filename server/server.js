process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//var config = require('./config/environment');
var seekrits = require('./config/local.env.sample');

var path = require('path');
var express = require('express');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var errors = require('./components/errors');
var root = path.normalize(__dirname + '../..');

var app = express();
require('./config/express')(app);

app.use('/auth', require('./api/auth'));

// API routes
app.use('/publicapi', require('./api/public'));
app.use('/api', expressJwt({ secret: seekrits.SESSION_SECRET }));

// node module content
app.use('/lib', express.static(path.join(__dirname, '../node_modules')));

app.route('/assets')
	.get(function(req, res) {
		res.sendfile(path.join(root, app.get('appPath'), 'assets', req.path));
	});

// web routes: all other routes should redirect to the index.html for client-side routing
app.route('/*')
	.get(function(req, res) {
		if (req.path.indexOf('.tmpl.html') !== -1) {
			res.sendfile(path.join(root, app.get('appPath'), 'app', req.path));
		}
		else
			res.sendfile(path.join(root, app.get('appPath'), 'index.html'));
	});

//models.sequelize.sync().success(function() {
	app.listen(9000, process.env.IP, function () {
	  console.log('Express server listening on %d', 9000);
	});
//});