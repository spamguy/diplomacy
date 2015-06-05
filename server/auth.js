'use strict';

var mongoose = require('mongoose'),
    passport = require('passport'),
    jwt = require('jsonwebtoken'),
    LocalStrategy = require('passport-local').Strategy;

var tokenAuth = function(username, password, done) {
    var User = mongoose.model('User');
    User.findByUsernameAndToken(username, password, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
    });
};

passport.use(new LocalStrategy(tokenAuth));

function authenticate(req, cb) {
    passport.authenticate('local', cb)(req);
}

function getIDFromToken(req) {
    return jwt.decode(req.data.token).id;
}

module.exports = {
    authenticate: authenticate,
    getIDFromToken: getIDFromToken
};
