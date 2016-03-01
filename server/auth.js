'use strict';

var mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    tokenAuth = function(username, password, done) {
        mongoose.model('User').findByEmailAndToken(username, password, function(err, user) {
            if (err) return done(err);
            if (!user) return done(null, false);
            return done(null, user);
        });
    };

passport.use(new LocalStrategy({
    usernameField: 'email'
}, tokenAuth));

function authenticate(req, cb) {
    passport.authenticate('local', cb)(req);
}

module.exports = {
    authenticate: authenticate
};
