'use strict';

var _ = require('lodash'),
    async = require('async');

module.exports = function() {
    var app = this.app,
        core = this.core;

    app.io.route('season', {
        get: function(req, res) {
            var gameID = req.data.gameID,
                year = req.data.year,
                seasonIndex = req.data.seasonIndex,
                userID = req.socket.decoded_token.id,
                game;

            async.waterfall([
                function(callback) {
                    core.game.get(gameID, callback);
                },

                function(_game, callback) {
                    game = _game;
                    core.season.get(game.id, seasonIndex, year, callback);
                }
            ], function(err, season) {
                if (err)
                    app.logger.error(err);

                if (!season)
                    return res.json(null);

                var p,
                    province,
                    currentSeason = game.currentSeason,
                    currentYear = game.currentYear,
                    isComplete = game.isComplete,
                    isGM = game.gm_id === userID,
                    isActive = !isGM && !isComplete && season.year === currentYear && season.season === currentSeason,
                    playerPower = _.find(game.players, function(p) { return p.player_id.toString() === userID.toString(); }),
                    powerShortName;

                if (playerPower)
                    powerShortName = playerPower.power;

                // Incomplete games and active seasons are sanitised for players' protection.
                if (isActive) {
                    for (p = 0; p < season.provinces.length; p++) {
                        province = province[p];
                        if (province.unitPower !== powerShortName)
                            _.omit(province, ['unitTarget', 'unitSubTarget', 'unitAction']);
                    }
                }

                return res.json(season.toJSON());
            });
        },

        create: function(req, res) {
            var season = req.data.season;

            core.season.create(season, function(err, savedSeason) {
                if (err)
                    app.logger.error(err);
            });
        },

        setorder: function(req, res) {
            // TODO: Make sure order issuer actually owns the unit!

            async.waterfall([
                // Get relevant season.
                function(callback) {
                    core.season.setOrder(req.data.seasonID, req.data.command, req.data.action, callback);
                }
            ], function(err) {
                if (err) {
                    app.logger.error(err);
                    return res.status(400).json({
                        message: err
                    });
                }

                return res.json({ status: 'ok' });
            });
        },

        toggleready: function(req, res) {
            var isReady = req.data.isReady,
                playerID = req.socket.decoded_token.id,
                gameID = req.data.gameID;
            app.logger.info('Player ' + playerID + ' has set ready flag to ' + isReady + ' in game ' + gameID);

            core.game.setReadyFlag(gameID, playerID, isReady, function(err, game) {
                if (err)
                    app.logger.info(err);

                // IS EVERYBODY READY?!
                // TODO: Delete any existing adjudication schedules.
                // TODO: Schedule near-immediate adjudication.
                if (game.isEverybodyReady)
                    app.logger.info('Everybody is ready in game ' + gameID + '. Scheduling adjudication.');
            });
        },

        adjudicate: function(req, res) {
            var playerID = req.socket.decoded_token.id,
                gameID = req.data.gameID,
                seasonID = req.data.seasonID;

            async.waterfall([
                function(callback) {
                    core.game.list({ gameID: gameID }, callback);
                },

                function(games, callback) {
                    if (games[0].gm_id.toString() !== playerID)
                        callback(new Error('You are not authorized to schedule adjudications for this game.'));
                    var job = app.queue.create('adjudicate', {
                        seasonID: seasonID
                    });

                    job.on('complete', function(err, result) {
                        if (!err)
                            req.socket.broadcast.to(result.gameID).emit('season:adjudicate:success', result);
                        else
                            app.logger.error(err);
                    });

                    job.backoff({ delay: 'exponential' })
                        .save(function(err) {
                            app.logger.info('Manual adjudication started', { gameID: gameID, seasonID: seasonID });
                            callback(err);
                        });
                }
            ], function(err) {
                if (err) {
                    app.logger.error(err);
                    return res.status(400).json({
                        message: err
                    });
                }
            });
        }
    });
};
