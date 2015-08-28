var express = require('express.oi'),
    jwt = require('jsonwebtoken'),
    bodyParser = require('body-parser'), // for crying out loud, STOP REMOVING THIS
    all = require('require-tree'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    agenda = require('agenda');

var models = all(__dirname + '/models'),
    controllers = all(__dirname + '/controllers'),
    core = require('./cores/index'),
    app = express();

var seekrits;
try {
    seekrits = require('./config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
    seekrits = require('./config/local.env.sample');
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Fire up scheduling.
app.agenda = new agenda({
    db: {
        address: seekrits.mongoURI
    }
});
all(__dirname + '/jobs', { each: function(obj) { obj(app.agenda, core); } });
app.agenda.start();

app.http().io();

_.each(controllers, function(controller) {
    controller.apply({
        core: core,
        app: app
    });
});

// many thanks to http://wmyers.github.io/technical/nodejs/Simple-JWT-auth-for-SocketIO/
app.io.on('connection', function(socket) {
    console.log('Attempting to connect socket ' + socket.id);
    delete app.io.sockets.connected[socket.id];

    var authTimeout = setTimeout(function() {
        console.log("Disconnecting socket ", socket.id);
        socket.disconnect('unauthorized');
    }, 2000);

    socket.on('authenticate', function(data) {
        if (data.token) {
            clearTimeout(authTimeout);
            validateToken(data.token, function(err, data) {
                if (!err && data) {
                    console.log('Authenticated socket ' + socket.id);
                    app.io.sockets.connected[socket.id] = socket;
                    socket.tokenData = data;
                    socket.emit('authenticated');
                }
                else {
                    console.log(err);
                }
            });
        }
    });

    var validateToken = function(token, callback) {
        console.log('Token = ' + token);
        jwt.verify(token, seekrits.SESSION_SECRET, function(err, decoded) {
            return callback(err, decoded);
        });
    };
});

mongoose.connect(seekrits.mongoURI);
mongoose.set('debug', true);

app.listen(9000, function() {
  console.log('Express server listening on %d', 9000);
});
