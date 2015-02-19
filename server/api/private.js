module.exports = (function() {
    'use strict';

    var express = require('express');
    var app = express();
    var mongoose = require('mongoose');

    var _ = require('lodash');
    var morgan = require('morgan');
    var compression = require('compression');
    var bodyParser = require('body-parser');
    var errorHandler = require('errorhandler');
    var jwt = require('jsonwebtoken');

    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last

    app.get('/users/:id/games', function(req, res) {
        var id = mongoose.Types.ObjectId(req.param('id'));

        return require('../models/game')(id).Game
            .find({ 'players.player_id': id }, function(err, players) {
                return res.send(players);
            });
    });

    app.get('/users/:id/games/:gid', function(req, res) {
        var id = mongoose.Types.ObjectId(req.param('id')),
            gid = mongoose.Types.ObjectId(req.param('gid'));

        return require('../models/game')(gid).Game
            .findOne({ '_id': gid }, function(err, game) {
                return res.send(game);
            });
    });

    /**
     * @description Fetches a set of movements for a game. The active season's moves -- excluding the player's -- are redacted.
     * @param  {string} id The ID of the game.
     * @param  {string} pid The player ID.
     * @param  {number} [season] The season to fetch.
     * @param  {number} [year] The year to fetch.
     * @return {Array} An array of arrays, one for each season requested.
     */
    app.get('/users/:pid/games/:id/moves', function(req, res) {
        var player_id = mongoose.Types.ObjectId(req.param('pid')),
            game_id = mongoose.Types.ObjectId(req.param('id')),
            token_player_id = jwt.decode(req.headers.authorization.split(' ')[1]).id,
            season = req.param('season'),
            year = req.param('year');

        // The user calling this method should match the token to prevent API exploitation.
        if (token_player_id !== player_id.toString())
            return res.send(401, 'Token does not match the supplied player.');

        require('../models/game')(player_id).Game.findOne({ '_id': game_id }, function(err, game) {
            var isComplete = game.isComplete,
                currentSeason = game.season,
                currentYear = game.year,
                playerPower = _.find(game.players, function(p) { return p.player_id.toString() === player_id.toString(); }),
                powerShortName = playerPower.power;

            var seasonQuery = require('../models/season').Season.find({ 'game_id': game_id });
            if (year)
                seasonQuery.find({ 'year': year });
            if (season)
                seasonQuery.find({ 'season': season });

            seasonQuery.lean().exec(function(err, seasons) {
                for (var s = 0; s < seasons.length; s++) {
                    var season = seasons[s];

                    // incomplete games and active seasons are sanitised for your protection
                    if (!isComplete && (season.year === currentYear && season.season === currentSeason)) {
                        for (var r = 0; r < season.regions.length; r++) {
                            var region = season.regions[r];
                            if (region.unit && region.unit.power !== powerShortName)
                                delete region.unit.order;
                        }
                    }
                }

                return res.send(seasons);
            });
        });
    });

    /**
     * @description Fetches a set of movements for a game. Intended to be publicly consumed and user-agnostic.
     * @param  {string} id The ID of the game.
     * @param  {number} [season] The season to fetch.
     * @param  {number} [year] The year to fetch.
     * @return {Array} An array of arrays, one for each season requested.
     */
    app.get('/games/:id/moves', function(req, res) {
        var id = mongoose.Types.ObjectId(req.param('id'));

        return require('../models/season').Season
            .find({ 'game_id': id }, function(err, moves) {
                return res.send(moves);
            });
    });

    return app;
}());
