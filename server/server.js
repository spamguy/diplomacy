var express = require('express.oi'),
    jwt = require('jsonwebtoken'),
    bodyParser = require('body-parser'), // for crying out loud, STOP REMOVING THIS
    app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', require('./api/auth')());
var seekrits;
try {
    seekrits = require('./config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
        seekrits = require('./config/local.env.sample');
}
// app.use('/api', require('./api/public')());
// app.use('/api', require('./api/private')());

app.http().io();

app.io.on('connection', function(socket) {
    socket.auth = false;
    socket.on('authenticate', function(data) {
        validateToken(data.token, function(err, success) {
            if (!err && success) {
                console.log('Authenticated socket ' + socket.id);
                socket.auth = true;
            }
        });
    });

    setTimeout(function() {
        if (!socket.auth) {
          console.log("Disconnecting socket ", socket.id);
          socket.disconnect('unauthorized');
        }
    }, 1000);

    var validateToken = function(token, callback) {
        console.log('Token = ' + token);
        jwt.verify(token, seekrits.SESSION_SECRET, function(err, decoded) {
            return callback(err, decoded);
        });
    };
});

app.io.route('login', {
    success: function(req, res) {
        //console.log('login:success');
    }
});

app.listen(9000, function() {
  console.log('Express server listening on %d', 9000);
});
