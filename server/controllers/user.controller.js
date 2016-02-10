'use strict';

var hashOptions = {
        'DEFAULT_HASH_ITERATIONS': 32000,
        'SALT_SIZE': 64,
        'KEY_LENGTH': 128
    },
    jwt = require('jsonwebtoken'),
    pbkdf2 = require('easy-pbkdf2')(hashOptions),
    auth = require('../auth'),
    mailer = require('../mailer/mailer'),
    SESSION_LENGTH = 60 * 60 * 4; // Session length, in seconds.

module.exports = function() {
    var app = this.app,
        core = this.core;

    // API FUNCTIONS: ROUTE TO SOCKETS
    app.post('/api/login', function(req) {
        req.io.route('user:login');
    });

    // app.get('/api/users/:username/exists', function(req) {
    //     req.io.route('user:exists');
    // });

    app.post('/api/users', function(req) {
        req.io.route('user:create');
    });

    app.post('/api/verify', function(req) {
        req.io.route('user:verify');
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
                    email: user.email,
                    id: user._id
                };

                return res.json({
                    id: user._id,
                    email: user.email,
                    token: jwt.sign(safeUser, app.seekrits.get('sessionSecret'), { expiresIn: SESSION_LENGTH })
                });
            });
        },

        // exists: function(req, res) {
        //     var options = { username: req.params.username };
        //
        //     var users = core.user.list(options, function(err, users) {
        //         return res.json({ exists: users.length === 1 });
        //     });
        // },

        // Creates new (or recycles existing) stub user. Contains only email address until extended by user:verify event.
        // TODO: Rewrite with async.
        create: function(req, res, next) {
            var email = req.body.email,
                cb = function(err) {
                    if (!err)
                        res.sendStatus(201);
                };
            core.user.getStubByEmail(email, function(err, users) {
                var stubUser;
                if (users.length > 0)
                    stubUser = users[0];
                else if (err)
                    throw new Error(err);
                else
                    stubUser = null;

                if (stubUser) {
                    sendVerifyEmail(app.seekrits, stubUser, cb);
                }
                else {
                    core.user.create({
                        tempEmail: email
                    }, function(err, newUser) {
                        if (!err)
                            sendVerifyEmail(app.seekrits, newUser, cb);
                        else
                            console.log(err);
                    });
                }
            });
        },

        /*
         * Fired after user visits validation page and clicks 'Save' button. Extends stub user object with:
         * - password/salt
         * - base points (0)
         */
        verify: function(req, res, next) {
            var verifyToken = req.body.token,
                salt = pbkdf2.generateSalt();

            jwt.verify(verifyToken, app.seekrits.get('sessionSecret'), function(err, payload) {
                if (err)
                    console.error(err);

                core.user.getStubByEmail(payload.email, function(err, users) {
                    if (err)
                        return new Error(err);
                    var user = users[0];
                    pbkdf2.secureHash(req.body.password, salt, function(err, hash, salt) {
                        if (err)
                            console.error(err);

                        user.password = hash;
                        user.passwordsalt = salt;
                        user.points = 0;
                        user.email = user.tempEmail; // promote tempEmail to email
                        delete user.tempEmail;

                        core.user.update(user, function(err, updatedUser) {
                            var safeUser = {
                                email: updatedUser.email,
                                id: updatedUser._id
                            };

                            if (!err) {
                                return res.json({
                                    id: updatedUser._id,
                                    token: jwt.sign(safeUser, app.seekrits.get('sessionSecret'), { expiresInMinutes: SESSION_LENGTH })
                                });
                            }
                        });
                    });
                });
            });
        },

        list: function(req, res) {
            var options = { ID: req.data.ID };
            core.user.list(options, function(err, users) {
                if (err)
                    console.error(err);

                var safeUsers = [],
                    u;
                for (u = 0; u < users.length; u++) {
                    safeUsers.push({
                        '_id': users[u]._id,
                        'email': users[u].email,
                        'points': users[u].points
                    });
                }
                return res.json(safeUsers);
            });
        }
    });
};

// PRIVATE FUNCTIONS

function sendVerifyEmail(seekrits, user, cb) {
    console.log('Sending verify email to ' + user.tempEmail);
    var safeUser = {
            email: user.tempEmail,
            id: user._id
        },
        options = {
            email: user.tempEmail,
            token: jwt.sign(safeUser, seekrits.get('sessionSecret'), { expiresIn: 24 * 60 * 60 }),
            baseURL: seekrits.get('domain'),
            subject: 'Verify your email address with dipl.io'
        };
    mailer.sendOne('verify', options, cb);
}
