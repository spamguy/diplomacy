'use strict';

var db = require('./../db');

function UserCore(core, logger) {
    this.core = core;
    this.logger = logger;
}

UserCore.prototype.get = function(id) {
    return db.models.User
    .where('id', id)
    .fetch({ withRelated: ['games', 'games.players', 'games.phases'] });
};

UserCore.prototype.getByEmail = function(email, cb) {
    if (!email)
        cb(new Error('No email address was supplied.'));

    db.models.User
        .where('email', email)
        .fetch({ columns: ['id', 'email', 'password', 'password_salt'] })
        .asCallback(cb);
};

UserCore.prototype.getStubByEmail = function(email, cb) {
    if (!email)
        cb(new Error('No email address was supplied.'));

    db.models.User
        .where({ 'temp_email': email, password: null })
        .fetch()
        .asCallback(cb);
};

UserCore.prototype.save = function(options, cb) {
    new db.models.User(options)
        .save()
        .asCallback(cb);
};

UserCore.prototype.adjustActionCount = function(playerID, penalty, cb) {
    if (penalty === 0)
        cb(null);
};

module.exports = UserCore;
