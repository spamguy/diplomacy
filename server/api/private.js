module.exports = function() {
    'use strict';

    var express = require('express.oi'),
        app = express(),
        mongoose = require('mongoose'),
        _ = require('lodash'),
        jwt = require('jsonwebtoken'),
        expressJwt = require('express-jwt');

    var seekrits;
    try {
        seekrits = require('../config/local.env');
    }
    catch (ex) {
        if (ex.code === 'MODULE_NOT_FOUND')
            seekrits = require('../config/local.env.sample');
    }

    var jwtConfig = expressJwt({
        secret: seekrits.SESSION_SECRET
    });

    app.get('/users/:id', jwtConfig, function(req, res) {
        var id = mongoose.Types.ObjectId(req.params.id);

        return require('../models/user').User
            .findOne({ '_id': id }, function(err, user) {
                // send highly sanitised version of user
                return res.json({
                    '_id': user._id,
                    points: user.points,
                    username: user.username,
                    email: user.email
                });
            });
    });

    app.get('/users/:id/games', jwtConfig, function(req, res) {
        var id = mongoose.Types.ObjectId(req.params.id);

        return require('../models/game')(id).Game
            .find({ 'players.player_id': id }, function(err, players) {
                return res.send(players);
            });
    });

    app.get('/users/:id/games/:gid', jwtConfig, function(req, res) {
        var id = mongoose.Types.ObjectId(req.params.id),
            gid = mongoose.Types.ObjectId(req.params.gid);

        return getGameByID(gid);
    });

    /**
     * @description Fetches a set of movements for a game. The active season's moves -- excluding the player's -- are redacted.
     * @param  {string} id The ID of the game.
     * @param  {string} pid The player ID.
     * @param  {number} [season] The season to fetch.
     * @param  {number} [year] The year to fetch.
     * @return {Array} An array of arrays, one for each season requested.
     */
    app.get('/users/:pid/games/:id/moves', jwtConfig, function(req, res) {
        var player_id = mongoose.Types.ObjectId(req.params.pid),
            game_id = mongoose.Types.ObjectId(req.params.id),
            token_player_id = jwt.decode(req.headers.authorization.split(' ')[1]).id,
            season = req.params.season,
            year = req.params.year;

        // The user calling this method should match the token to prevent API exploitation.
        if (token_player_id !== player_id.toString())
            return res.send(401, 'Token does not match the supplied player.');


        require('../models/game')(player_id).Game.findOne({ '_id': game_id }, function(err, game) {
            if (!game)
                return res.json([]);

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
    app.get('/games/:id/moves', jwtConfig, function(req, res) {
        var id = mongoose.Types.ObjectId(req.params.id);

        return require('../models/season').Season
            .find({ 'game_id': id }, function(err, moves) {
                return res.send(moves);
            });
    });

    /**
     * @description Saves new game.
     * @return {string} The ID of the new game.
     */
    app.post('/games', jwtConfig, function(req, res) {
        var game = require('../models/game')().Game({
            variant: req.body.variant.toLowerCase(),
            name: req.body.name,
            visibility: req.body.visibility,
            movementClock: req.body.movement.clock,
            players: [{
                    player_id: req.body.playerID,
                    power: '*'
                }
            ]
        });

        // TODO: if clock is chosen, delete calendar properties (and vice-versa) to guarantee one scheduling mode

        // generate password hash
        if (game.visibility === 'private') {
            // TODO: hash password as found in /auth/new
            game.passwordsalt = '';
            game.password = '';
        }

        game.save();

        return res.send(201);
    });

    // TODO: Let non-users see this list to show what they're missing out on?
    app.get('/games', jwtConfig, function(req, res) {
        var query = require('../models/game')().Game
            .find({ })
            .where('this.players.length - 1 < this.maxPlayers')
            .exec(function(err, games) {
                return res.send(games);
            });
    });

    app.post('/users/{:pid}/games', jwtConfig, function(req, res) {
        var player_id = mongoose.Types.ObjectId(req.params.pid),
            gid = mongoose.Types.ObjectId(req.body.gameID),
            token_player_id = jwt.decode(req.headers.authorization.split(' ')[1]).id,
            game = getGameByID(gid);

            if (!game)
                return res.status(500).json({ error: 'The game provided does not exist.'});

            // if user already belongs, do not join
            if (_.find(game.players, _.matchesProperty('player_id', player_id.toString())))
                return res.status(500).json({ error: 'This user already belongs to this game.'});

            var newPlayerObject = { player_id: player_id };
            if (req.body.prefs)
                newPlayerObject.prefs = req.body.prefs;

            // append new player to game's player list
            require('../models/game')(gid).Game.update(
                { _id: gid },
                { $push: { 'players': newPlayerObject } },
                { upsert: true },
                function(err, data) {
                }
            );
    });

    // PRIVATE FUNCTIONS
    var getGameByID = function(gid) {
        require('../models/game')(gid).Game
            .findOne({ '_id': gid }, function(err, game) {
                return game;
            });
    };

    return app;
};
