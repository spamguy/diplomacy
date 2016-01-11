var express = require('express.oi'),
    bodyParser = require('body-parser'), // for crying out loud, STOP REMOVING THIS
    all = require('require-tree'),
    _ = require('lodash'),
    Mongoose = require('mongoose'),
    Agenda = require('agenda'),
    controllers = all(__dirname + '/controllers'),
    core = require('./cores/index'),
    app = express(),
    socketioJWT = require('socketio-jwt'),
    seekrits;
try {
    seekrits = require('./config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
        seekrits = require('./config/local.env.sample');
}

// Register models.
all(__dirname + '/models');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Fire up scheduling.
app.agenda = new Agenda({
    db: {
        address: seekrits.mongoURI
    }
});
app.agenda.on('ready', function() {
    all(__dirname + '/jobs', { each: function(obj) { obj(app.agenda, core); } });
    app.agenda.start();
});

app.http().io();

_.each(controllers, function(controller) {
    controller.apply({
        core: core,
        app: app
    });
});

app.io.use(socketioJWT.authorize({
    secret: seekrits.SESSION_SECRET,
    handshake: true
}));

app.io.on('error', function(err) {
    console.log('Unable to authenticate: ' + JSON.stringify(err));
});

Mongoose.connect(seekrits.mongoURI);
Mongoose.set('debug', true);

app.listen(9000, function() {
    console.log('Express server listening on %d', 9000);
});
