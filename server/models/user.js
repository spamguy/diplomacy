var hashOptions = {
    'DEFAULT_HASH_ITERATIONS': 32000,
    'SALT_SIZE': 64,
    'KEY_LENGTH': 128
};

var mongoose = require('mongoose'),
    pbkdf2 = require('easy-pbkdf2')(hashOptions);

var UserSchema = new mongoose.Schema({
    password: String,
    passwordsalt: String,
    email: String,
    tempEmail: String,
    points: Number,
    timezone: Number
});

UserSchema.statics.findByEmailAndToken = function(email, plaintextPassword, cb) {
    if (!email)
        return cb(null, null);

    // find user with username, then compare its hash against what was provided
    this.findOne({ email: email }, function(err, maybeUser) {
        if (err)
            return cb(err);

        if (!maybeUser)
            return cb(null, null);

        pbkdf2.verify(maybeUser.passwordsalt, maybeUser.password, plaintextPassword, function(err, match) {
            if (match)
                return cb(null, maybeUser);
            else if (!match)
                return cb(null, null);
            else
                return cb(err);
        });
    });
};

module.exports = mongoose.model('User', UserSchema);
