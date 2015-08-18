'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash');

function UserCore(options) {
    this.core = options.core;
}

UserCore.prototype.create = function(options, cb) {
    var User = mongoose.model('User');
    var user = new User(options);

    user.save(cb);
};

UserCore.prototype.update = function(existingUser, cb) {
    var User = mongoose.model('User');
    existingUser.save(cb);
};

UserCore.prototype.list = function(options, cb) {
    options = options || { };
    var User = mongoose.model('User');
    var query = User.find(_.pick({
        '_id': options.ID,
        'username': options.username,
        'password': options.password,
        'email': options.email,
        'tempEmail': options.tempEmail
    }, _.identity));

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
        //username: { '$exists': false },
        password: { '$exists': false }
    }, cb);
};

module.exports = UserCore;
