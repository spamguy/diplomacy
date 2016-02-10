var path = require('path'),
    express = require('express.oi'),
    bodyParser = require('body-parser'), // for crying out loud, STOP REMOVING THIS
    all = require('require-tree'),
    _ = require('lodash'),
    Mongoose = require('mongoose'),
    Agenda = require('agenda'),
    controllers = all(__dirname + '/controllers'),
    core = require('./cores/index'),
    app = express(),
    socketioJWT = require('socketio-jwt');
    var seekrits = require('nconf')
        .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
        .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json'));

// Register models.
all(__dirname + '/models');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Fire up scheduling.
app.agenda = new Agenda({
    db: {
        address: seekrits.get('mongoURI')
    }
});
app.agenda.on('ready', function() {
    all(__dirname + '/jobs', {
        each: function(obj) { obj(app.agenda, core); },
        filter: function(filename) { return filename.indexOf('spec') < 0; }
    });
    app.agenda.start();
});
app.seekrits = seekrits;

app.http().io();

_.each(controllers, function(controller) {
    controller.apply({
        core: core,
        app: app
    });
});

app.io.use(socketioJWT.authorize({
    secret: seekrits.get('sessionSecret'),
    handshake: true
}));

app.io.on('error', function(err) {
    console.log('Unable to authenticate: ' + JSON.stringify(err));
});

Mongoose.connect(seekrits.get('mongoURI'));
Mongoose.set('debug', true);

app.listen(9000, function() {
    console.log('Express server listening on %d', 9000);
});
