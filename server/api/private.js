module.exports = (function() {
    'use strict';

    var express = require('express');
    var app = express();
    var mongoose = require('mongoose');

    var morgan = require('morgan');
    var compression = require('compression');
    var bodyParser = require('body-parser');
    var errorHandler = require('errorhandler');

    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last

    app.get('/users/:id/games', function(req, res) {
        var id = mongoose.Types.ObjectId(req.param('id'));

        return require('../models/game')(id).Game
            .find({ 'players._id': id }, function(err, players) {
                return res.send(players);
            });
    });

    app.get('/users/:id/games/:gid/moves', function(req, res) {
        var player_id = mongoose.Types.ObjectId(req.param('id')),
            game_id = mongoose.Types.ObjectId(req.param('gid'));

        return require('../models/playerseason').PlayerSeason
            .find({ 'game_id': game_id, 'player_id': player_id }, function(err, moves) {
                return res.send(moves);
            });
    });

    app.get('/games/:id/moves', function(req, res) {
        var id = mongoose.Types.ObjectId(req.param('id'));

        return require('../models/playerseason').PlayerSeason
            .find({ 'game_id': id }, function(err, moves) {
                return res.send(moves);
            });
    });

    return app;
}());
