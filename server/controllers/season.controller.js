'use strict';

var _ = require('lodash'),
    async = require('async');

module.exports = function() {
    var app = this.app,
        core = this.core;

    app.io.route('season', {
        list: function(req, res) {
            var gameID = req.data.gameID,
                options = { gameID: gameID, lean: true },
                userID = req.socket.decoded_token.id;

            async.waterfall([
                // Fetch the game.
                function(callback) {
                    core.game.list(options, callback);
                },

                // Fetch the matching seasons.
                function(games, callback) {
                    core.season.list(options, function(err, seasons) {
                        callback(err, games[0], seasons);
                    });
                }],

                // Strip out movements the user shouldn't see.
                function(err, game, seasons) {
                    if (err)
                        app.logger.error(err);

                    var SeasonSchema = require('mongoose').model('Season'),
                        r,
                        s,
                        season,
                        region,
                        isComplete = game.isComplete,
                        isGM = game.gm_id.toString() === userID,
                        currentSeason = game.season,
                        currentYear = game.year,
                        playerPower = _.find(game.players, function(p) { return p.player_id.toString() === userID.toString(); }),
                        powerShortName;

                    if (playerPower)
                        powerShortName = playerPower.power;

                    for (s = 0; s < seasons.length; s++) {
                        season = seasons[s];

                        // Incomplete games and active seasons are sanitised for players' protection.
                        if (!isGM && !isComplete && season.year === currentYear && season.season === currentSeason) {
                            for (r = 0; r < season.regions.length; r++) {
                                region = SeasonSchema.getUnitOwnerInRegion(season.regions[r]);
                                if (region && region.unit.power !== powerShortName)
                                    delete region.unit.order;
                            }
                        }
                    }

                    return res.json(seasons);
                }
            );
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
