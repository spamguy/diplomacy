process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//var config = require('./config/environment');
var seekrits = require('./config/local.env.sample');

var path = require('path');
var express = require('express');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var errors = require('./components/errors');
var root = path.normalize(__dirname + '../../client');

var app = express();
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(errorHandler()); // Error handler - has to be last

app.use('/auth', require('./api/auth'));

// API routes
app.use('/publicapi', require('./api/public'));
app.use('/api', expressJwt({ secret: seekrits.SESSION_SECRET }));
app.use('/api', require('./api/private'));

// node module content
app.use('/lib', express.static(path.join(root, '../node_modules')));

app.use(express.static(root));

// web routes: all other routes should redirect to the index.html for client-side routing
app.route('/*')
	.get(function(req, res) {
		if (req.path.indexOf('.tmpl.html') !== -1) {
			res.sendfile(path.join(root, 'app', req.path));
		}
		else
			res.sendfile(path.join(root, 'index.html'));
	});

//models.sequelize.sync().success(function() {
	app.listen(9000, process.env.IP, function () {
	  console.log('Express server listening on %d', 9000);
	});
//});