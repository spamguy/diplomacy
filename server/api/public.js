module.exports = (function() {
    var express = require('express');
    var app = express();
    //var models = require('../models');

    app.get('/users/:username/exists', function(req, res) {
        var username = req.param('username');

        require('../models/user').User
            .find({ 'username': username }, function(err, users) {
                res.json({ exists: users.length === 1 });
            });
    });

    return app;
}());
