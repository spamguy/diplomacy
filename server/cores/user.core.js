'use strict';

var db = require('./../db');

function UserCore(options) {
    this.core = options.core;
}

UserCore.prototype.get = function(id, cb) {
    db.models.User.findById(id).nodeify(cb);
};

UserCore.prototype.getByEmail = function(email, cb) {
    if (!email)
        cb(new Error('No email address was supplied.'));

    db.models.User.findOne({
        where: { email: email },
        attributes: ['passwordSalt', 'password']
    }).nodeify(cb);
};

UserCore.prototype.getStubByEmail = function(email, cb) {
    if (!email)
        cb(new Error('No email address was supplied.'));

    db.models.User.findOne({
        where: {
            $and: {
                tempEmail: email,
                password: null
            }
        }
    }).nodeify(cb);
};

UserCore.prototype.create = function(options, cb) {
    var user = db.models.User.build(options);

    this.save(user, cb);
};

UserCore.prototype.save = function(user, cb) {
    user.save().nodeify(cb);
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
