'use strict';

var async = require('async');

module.exports = function() {
    var app = this.app,
        core = this.core;

    app.io.route('phase', {
        get: function(req, res) {
            core.phase.get(req.data.gameID, req.data.offset)
            .then(function(phase) {
                return res.json(phase.toJSON({ currentUserID: req.socket.decoded_token.id }));
            })
            .catch(function(err) {
                app.logger.error(err);
                return res.status(400).json({ error: err });
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
                    core.phase.setOrder(req.data.variant, req.data.phaseID, req.data.season, req.data.command, req.data.action).asCallback(callback);
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

            async.waterfall([
                function(callback) {
                    core.game.setReadyFlag(gameID, playerID, isReady, callback);
                },

                function(callback) {
                    core.game.get(gameID, callback);
                },

                function(game, callback) {
                    // IS EVERYBODY READY?!
                    // TODO: Delete any existing adjudication schedules.
                    // TODO: Schedule near-immediate adjudication.
                    if (game.isEverybodyReady())
                        app.logger.info('Everybody is ready in game ' + gameID + '. Scheduling adjudication.');
                }
            ], function(err) {
                if (err)
                    app.logger.info(err);
            });
        },

        adjudicate: function(req, res) {
            var playerID = req.socket.decoded_token.id,
                gameID = req.data.gameID;

            async.waterfall([
                function(callback) {
                    core.game.get(gameID, callback);
                },

                function(game, callback) {
                    if (game.get('gmId') !== playerID) {
                        callback(new Error('You are not authorized to schedule adjudications for this game.'));
                        return;
                    }

                    // FIXME: Purge all existing jobs with this game ID.

                    var job = app.queue.create('adjudicate', {
                        gameID: gameID
                    });

                    job.backoff({ delay: 'exponential' })
                        .save(function(err) {
                            app.logger.info('Manual adjudication started', { gameID: gameID });
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
