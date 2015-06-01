'use strict';

var mongoose = require('mongoose');

function UserCore(options) {
    this.core = options.core;
}

UserCore.prototype.create = function(provider, options, cb) {
    var User = mongoose.model('User');
    var user = new User({ provider: provider });

    user.save(cb);
};

UserCore.prototype.list = function(options, cb) {
    options = options || { };
    var User = mongoose.model('User');
    var query = User.find(options);

    query.exec(function(err, users) {
        if (err) {
            console.error(err);
            return cb(err);
        }

        cb(null, users);
    });
};

module.exports = UserCore;
