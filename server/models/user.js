var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  passwordsalt: String,
  refreshtoken: String,
  email: String
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User: User
};