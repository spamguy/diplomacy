module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
	email: DataTypes.STRING,
	password: DataTypes.STRING,
	passwordsalt: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  }).schema('users');

  return User;
};