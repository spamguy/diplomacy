'use strict';

var db = require('./../db');

function UserCore(options) {
    this.core = options.core;
}

UserCore.prototype.get = function(id, cb) {
    db.models.User
        .where('id', id)
        .fetch({ withRelated: ['games.players', {
            'games.phases': function(query) {
                query.orderBy('created_at', 'desc').limit(1);
            }
        }]})
        .asCallback(cb);
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
        .where({ tempEmail: email, password: null })
        .fetch()
        .asCallback(cb);
};

UserCore.prototype.save = function(options, cb) {
    db.models.User.save(options).asCallback(cb);
};

UserCore.prototype.adjustActionCount = function(playerID, penalty, cb) {
    if (penalty === 0)
        cb(null);

    // mongoose.model('User').findOneAndUpdate(
    //     { _id: playerID },
    //     { $inc: {
    //         actionCount: penalty,
    //         lateActionCount: penalty
    //     } },
    //     { },
    //     cb
    // );
};

module.exports = UserCore;
