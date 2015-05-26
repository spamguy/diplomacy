var express = require('express.oi'),
    bodyParser = require('body-parser'), // for crying out loud, STOP REMOVING THIS
    all = require('require-tree'),
    _ = require('lodash'),
    mongoose = require('mongoose');

var models = all('./models'),
    controllers = all('./controllers'),
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

// app.use('/api', require('./api/auth')());
// app.use('/api', require('./api/public')());
// app.use('/api', require('./api/private')());

app.http().io();

_.each(controllers, function(controller) {
    controller.apply({
        core: core,
        app: app
    });
});

mongoose.connect(seekrits.mongoURI);
mongoose.set('debug', true);

app.listen(9000, function() {
  console.log('Express server listening on %d', 9000);
});
