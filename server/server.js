var seekrits;
try {
    seekrits = require('./config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
        seekrits = require('./config/local.env.sample');
}

var express = require('express');
var expressJwt = require('express-jwt');
var morgan = require('morgan');
// var compression = require('compression');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');

var app = express();
// app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', require('./api/auth'));

// API routes
app.use('/publicapi', require('./api/public'));
app.use('/api', require('./api/private'));
app.use('/api', expressJwt({ secret: seekrits.SESSION_SECRET }));

app.listen(seekrits.PORT || 9000, function () {
  console.log('Express server listening on %d', seekrits.PORT || 9000);
});
