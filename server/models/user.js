debugger;
var db = require('./../db')(),
    User = db.define('user', {
    });

module.exports = User;
