

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
// app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', require('./api/auth'));

// API routes
app.use('/api', require('./api/public'));
app.use('/api', require('./api/private'));

app.listen(9000, function () {
  console.log('Express server listening on %d', 9000);
});
