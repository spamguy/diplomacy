var path = require('path'),
    express = require('express.oi'),
    bodyParser = require('body-parser'), // for crying out loud, STOP REMOVING THIS
    all = require('require-tree'),
    _ = require('lodash'),
    kue = require('kue'),
    controllers = all(path.join(__dirname, '/controllers')),
    core = require('./cores/index'),
    app = express(),
    socketioJWT = require('socketio-jwt'),
    seekrits = require('nconf')
        .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
        .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Add logging transports.
app.logger = require('./logger');

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

// Fire up scheduling.
app.queue = kue.createQueue({
    redis: {
        auth: seekrits.get('redis:password')
    }
});

// Add queue-level event handling, because job-level won't handle sockets. See https://github.com/Automattic/kue#queue-events.
app.queue.on('job complete', function(id, result) {
    kue.Job.get(id, function(err, job) {
        if (!err) {
            var nextJob = app.queue.create('adjudicate', {
                gameID: job.result.id
            });

            debugger;
            nextJob.delay(new Date(result.phases[0].deadline))
                .backoff({ delay: 'exponential' })
                .save();
            app.io.to(job.result.id).emit('phase:adjudicate:success', job.result);
            app.io.to(job.result.id).emit('phase:adjudicate:update', job.result);
        }
        else {
            app.logger.error(err);
        }
    });
});

all(path.join(__dirname, '/jobs'), {
    each: function(job) {
        app.queue.process(job.name, job.process);
    }
});

app.listen(9000, function() {
    app.logger.info('Express server listening on %d', 9000);
});
