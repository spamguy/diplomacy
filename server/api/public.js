module.exports = function() {
    var express = require('express'),
        app = express(),
        glob = require('glob'),
        fs = require('fs'),
        path = require('path');

    app.get('/users/:username/exists', function(req, res) {
        var username = req.params.username;

        require('../models/user').User
            .find({ 'username': username }, function(err, users) {
                res.json({ exists: users.length === 1 });
            });
    });

    app.get('/variants', function(req, res) {
        glob('variants/**/*.json', function(err, files) {
            var nameList = [];
            for (var v = 0; v < files.length; v++)
                nameList.push(JSON.parse(fs.readFileSync(path.join(__dirname, '../..', files[v]))).name);

            res.json(nameList);
        });
    });

    return app;
};
