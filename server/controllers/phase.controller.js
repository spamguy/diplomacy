'use strict';

var _ = require('lodash'),
    async = require('async');

module.exports = function() {
    var app = this.app,
        core = this.core;

    app.io.route('phase', {
        get: function(req, res) {
            var gameID = req.data.gameID,
                year = req.data.year,
                phaseIndex = req.data.phaseIndex,
                userID = req.socket.decoded_token.id,
                game;

            async.waterfall([
                function(callback) {
                    core.game.get(gameID, callback);
                },

                function(_game, callback) {
                    game = _game;
                    core.phase.get(game.id, phaseIndex, year, callback);
                }
            ], function(err, phase) {
                if (err)
                    app.logger.error(err);

                if (!phase)
                    return res.json(null);

                var p,
                    province,
                    currentPhase = game.currentPhase,
                    currentYear = game.currentYear,
                    isComplete = game.isComplete,
                    isGM = game.gm_id === userID,
                    isActive = !isGM && !isComplete && phase.year === currentYear && phase.phase === currentPhase,
                    playerPower = _.find(game.players, function(p) { return p.user_id === userID; }),
                    powerShortName;

                if (playerPower)
                    powerShortName = playerPower.power;

                // Incomplete games and active phases are sanitised for players' protection.
                // if (isActive) {
                //     for (p = 0; p < phase.provinces.length; p++) {
                //         province = province[p];
                //         if (province.unitPower !== powerShortName)
                //             _.omit(province, ['unitTarget', 'unitSubTarget', 'unitAction']);
                //     }
                // }

                return res.json(phase.toJSON(isActive));
            });
        },

        create: function(req, res) {
            var phase = req.data.phase;

            core.phase.create(phase, function(err, savedPhase) {
                if (err)
                    app.logger.error(err);
            });
        },

        setorder: function(req, res) {
            // TODO: Make sure order issuer actually owns the unit!

            async.waterfall([
                // Get relevant phase.
                function(callback) {
                    core.phase.setOrder(req.data.phaseID, req.data.command, req.data.action, callback);
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
                phaseID = req.data.phaseID;

            async.waterfall([
                function(callback) {
                    core.game.list({ gameID: gameID }, callback);
                },

                function(games, callback) {
                    if (games[0].gm_id.toString() !== playerID)
                        callback(new Error('You are not authorized to schedule adjudications for this game.'));
                    var job = app.queue.create('adjudicate', {
                        phaseID: phaseID
                    });

                    job.on('complete', function(err, result) {
                        if (!err)
                            req.socket.broadcast.to(result.gameID).emit('phase:adjudicate:success', result);
                        else
                            app.logger.error(err);
                    });

                    job.backoff({ delay: 'exponential' })
                        .save(function(err) {
                            app.logger.info('Manual adjudication started', { gameID: gameID, phaseID: phaseID });
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
