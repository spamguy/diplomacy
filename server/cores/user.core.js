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

module.exports = UserCore;
