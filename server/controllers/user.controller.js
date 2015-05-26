'use strict';

var jwt = require('jsonwebtoken');

var auth = require('../auth');

var hashOptions = {
    'DEFAULT_HASH_ITERATIONS': 32000,
    'SALT_SIZE': 64,
    'KEY_LENGTH': 128
};
var SESSION_LENGTH = 60 * 4;
var seekrits;
try {
    seekrits = require('../config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
        seekrits = require('../config/local.env.sample');
}

module.exports = function() {
    var app = this.app,
        core = this.core;

    // API FUNCTIONS: ROUTE TO SOCKETS
    app.post('/api/login', function(req) {
        req.io.route('user:login');
    });

    // SOCKETS
    app.io.route('user', {
        login: function(req, res) {
            auth.authenticate(req, function(err, user) {
                if (err) {
                    return res.status(400).json({
                        message: 'There was a problem logging you in. Please try again later.',
                        error: err
                    });
                }

                if (!user) {
                    return res.status(401).json({
                        message: 'Incorrect username and/or password.'
                    });
                }

                var safeUser = {
                    username: user.username,
                    id: user._id
                };

                return res.json({
                    username: user.username,
                    id: user._id,
                    token: jwt.sign(safeUser, seekrits.SESSION_SECRET, { expiresInMinutes: SESSION_LENGTH })
                });
            });
        }
    });
};
