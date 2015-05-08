var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var bodyParser = require('body-parser');

// Express stuff
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// socket.io stuff
var io = socketio();
app.io = io;

io.on('connection', function(socket) {
    console.log('Connected!');
});

app.use('/api', require('./api/auth'));

// API routes
app.use('/api', require('./api/public'));
app.use('/api', require('./api/private'));

app.listen(9000, function () {
  console.log('Express server listening on %d', 9000);
});
