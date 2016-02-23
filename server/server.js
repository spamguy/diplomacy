var path = require('path'),
    express = require('express.oi'),
    bodyParser = require('body-parser'), // for crying out loud, STOP REMOVING THIS
    all = require('require-tree'),
    _ = require('lodash'),
    Mongoose = require('mongoose'),
    kue = require('kue'),
    controllers = all(__dirname + '/controllers'),
    core = require('./cores/index'),
    app = express(),
    socketioJWT = require('socketio-jwt'),
    seekrits = require('nconf')
        .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
        .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json'));

// Register models.
all(__dirname + '/models');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Fire up scheduling.
app.queue = kue.createQueue({
    redis: {
        auth: seekrits.get('redis:password')
    }
});

all(__dirname + '/jobs', {
    each: function(job) {
        app.queue.process(job.name, job.process);
    },
    filter: function(filename) { return filename.indexOf('spec') < 0; }
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
