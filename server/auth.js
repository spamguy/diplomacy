'use strict';

var mongoose = require('mongoose'),
    passport = require('passport'),
    jwt = require('jsonwebtoken'),
    LocalStrategy = require('passport-local').Strategy;

var tokenAuth = function(email, password, done) {
    var User = mongoose.model('User');
    User.findByEmailAndToken(email, password, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
    });
};

passport.use(new LocalStrategy(tokenAuth));

function authenticate(req, cb) {
    passport.authenticate('local', cb)(req);
}

module.exports = {
    authenticate: authenticate
};
