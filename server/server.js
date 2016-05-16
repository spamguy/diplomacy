var path = require('path'),
    express = require('express.oi'),
    bodyParser = require('body-parser'), // for crying out loud, STOP REMOVING THIS
    all = require('require-tree'),
    _ = require('lodash'),
    winston = require('winston'),
    kue = require('kue'),
    controllers = all(path.join(__dirname, '/controllers')),
    core = require('./cores/index'),
    app = express(),
    socketioJWT = require('socketio-jwt'),
    seekrits = require('nconf')
        .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
        .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json'));

// Register models.
all(path.join(__dirname, '/models'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Fire up scheduling.
app.queue = kue.createQueue({
    redis: {
        auth: seekrits.get('redis:password')
    }
});

// Add logging transports.
app.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)()
    ]
});

all(path.join(__dirname, '/jobs'), {
    each: function(job) {
        app.queue.process(job.name, job.process);
    }
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

app.listen(9000, function() {
    app.logger.info('Express server listening on %d', 9000);
});
