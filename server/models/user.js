var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  passwordsalt: String,
  email: String
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User: User
};
// module.exports = function(sequelize, DataTypes) {
//   var User = sequelize.define("User", {
//     username: DataTypes.STRING,
// 	email: DataTypes.STRING,
// 	password: DataTypes.STRING,
// 	passwordsalt: DataTypes.STRING
//   }, {
//     classMethods: {
//       associate: function(models) {
//       }
//     }
//   }).schema('users');

//   return User;
// };