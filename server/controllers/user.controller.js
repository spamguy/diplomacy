'use strict';

var hashOptions = {
        'DEFAULT_HASH_ITERATIONS': 64000,
        'SALT_SIZE': 64,
        'KEY_LENGTH': 128
    },
    jwt = require('jsonwebtoken'),
    pbkdf2 = require('easy-pbkdf2')(hashOptions),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mailer = require('../mailer/mailer'),
    async = require('async'),
    SESSION_LENGTH = 60 * 60 * 4; // Session length, in seconds.

module.exports = function() {
    var app = this.app,
        core = this.core;

    // API FUNCTIONS: ROUTE TO SOCKETS
    app.post('/api/login', function(req) {
        req.io.route('user:login');
    });

    app.post('/api/users', function(req) {
        req.io.route('user:create');
    });

    app.post('/api/verify', function(req) {
        req.io.route('user:verify');
    });

    // SOCKETS
    app.io.route('user', {
        login: function(req, res) {
            var user;

            async.waterfall([
                function(callback) {
                    authenticate(core.user, req, callback);
                },

                function(_user, dummy, callback) {
                    user = _user;
                    if (!user) {
                        return res.status(401).json({
                            message: 'Incorrect username and/or password.'
                        });
                    }

                    user.save({ lastLogin: new Date() }, { patch: true }).asCallback(callback);
                }
            ], function(err) {
                if (err) {
                    app.logger.error(err);
                    return res.status(400).json({
                        message: 'There was a problem logging you in. Please try again later.',
                        error: err
                    });
                }

                var safeUser = {
                    email: user.email,
                    id: user.id
                };

                return res.json({
                    id: user.id,
                    email: user.email,
                    token: jwt.sign(safeUser, app.seekrits.get('sessionSecret'), { expiresIn: SESSION_LENGTH })
                });
            });
        },

        // Creates new (or recycles existing) stub user. Contains only email address until extended by user:verify event.
        create: function(req, res, next) {
            var email = req.body.email;

            async.waterfall([
                function(callback) {
                    core.user.getByEmail(email, callback);
                },

                function(user, callback) {
                    if (user) {
                        callback(new Error('A user with this email address already exists.'));
                        return;
                    }
                    else {
                        core.user.getStubByEmail(email, callback);
                    }
                },

                function(user, callback) {
                    if (!user) {
                        core.user.save({
                            tempEmail: email
                        }, callback);
                    }
                    else {
                        callback(null, user);
                    }
                },

                function(user, callback) {
                    sendVerifyEmail(app.seekrits, user, callback);
                }
            ], function(err) {
                if (err) {
                    app.logger.error(err);
                    return res.status(400).json({
                        error: err
                    });
                }

                return res.json('ok');
            });
        },

        // Fired after user visits validation page and clicks 'Save' button. Extends stub user object with password/salt.
        verify: function(req, res, next) {
            var verifyToken = req.body.token,
                salt = pbkdf2.generateSalt(),
                verifiedUser;

            async.waterfall([
                function(callback) {
                    jwt.verify(verifyToken, app.seekrits.get('sessionSecret'), callback);
                },

                function(payload, callback) {
                    core.user.getStubByEmail(payload.email, callback);
                },

                function(user, callback) {
                    verifiedUser = user;
                    pbkdf2.secureHash(req.body.password, salt, callback);
                },

                function(hash, salt, callback) {
                    verifiedUser.save({
                        password: hash,
                        passwordSalt: salt,
                        email: verifiedUser.get('tempEmail'),
                        tempEmail: null
                    }).asCallback(callback);
                }
            ], function(err, updatedUser) {
                if (err) {
                    app.logger.error(err);
                    return res.status(400).json({
                        error: err
                    });
                }
                else {
                    var safeUser = {
                        email: updatedUser.get('email'),
                        id: updatedUser.get('id')
                    };
                    return res.json({
                        id: updatedUser.get('id'),
                        token: jwt.sign(safeUser, app.seekrits.get('sessionSecret'), { expiresIn: SESSION_LENGTH })
                    });
                }
            });
        },

        get: function(req, res) {
            core.user.get(req.data.ID)
            .then(function(game) {
                return res.json(game.toJSON({ currentUserID: req.socket.decoded_token.id }));
            })
            .catch(function(err) {
                app.logger.error(err);
                return res.status(400).json({ error: err });
            });
        }
    });
};

// PRIVATE FUNCTIONS

function sendVerifyEmail(seekrits, user, cb) {
    var safeUser = {
            email: user.get('tempEmail'),
            id: user.get('id')
        },
        options = {
            email: user.get('tempEmail'),
            token: jwt.sign(safeUser, seekrits.get('sessionSecret'), { expiresIn: 24 * 60 * 60 }),
            baseURL: seekrits.get('domain'),
            subject: 'Verify your email address with dipl.io'
        };
    mailer.sendOne('verify', options, cb);
}

function authenticate(userCore, req, cb) {
    passport.use(new LocalStrategy({
        usernameField: 'email'
    }, function(username, password, done) {
        userCore.getByEmail(username, function(err, maybeUser) {
            if (err) return done(err);
            if (!maybeUser) return done(null, null);

            // Find user with username, then compare its hash against what was provided.
            pbkdf2.verify(maybeUser.get('passwordSalt'), maybeUser.get('password'), password, function(err, isVerified) {
                if (!isVerified)
                    return done(err, null);
                else
                    return done(err, maybeUser);
            });
        });
    }));

    passport.authenticate('local', cb)(req);
}
