'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash');

function UserCore(options) {
    this.core = options.core;
}

UserCore.prototype.create = function(options, cb) {
    var User = mongoose.model('User'),
        user = new User(options);

    user.save(cb);
};

UserCore.prototype.update = function(existingUser, cb) {
    existingUser.save(cb);
};

UserCore.prototype.list = function(options, cb) {
    options = options || { };
    var User = mongoose.model('User'),
        query = User.find(_.pick({
            '_id': options.ID,
            'username': options.username,
            'password': options.password,
            'email': options.email,
            'tempEmail': options.tempEmail
        }, _.identity));

    if (options.cache !== false)
        query.cache(300);

    query.exec(function(err, users) {
        if (err) {
            console.error(err);
            return cb(err);
        }

        cb(null, users);
    });
};

UserCore.prototype.getStubByEmail = function(email, cb) {
    this.list({
        tempEmail: email,
        password: { '$exists': false },
        cache: false
    }, cb);
};

module.exports = UserCore;
