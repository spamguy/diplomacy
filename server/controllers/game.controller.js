'use strict';

var _ = require('lodash'),
    pluralize = require('pluralize'),
    async = require('async'),
    path = require('path'),
    mailer = require('../mailer/mailer');

module.exports = function() {
    var app = this.app,
        core = this.core;
        // initRegions = function(variant) {
        //     var regions = [],
        //         vr,
        //         variantRegion,
        //         baseRegion,
        //         subregion,
        //         sr;
        //
        //     for (vr = 0; vr < variant.regions.length; vr++) {
        //         variantRegion = variant.regions[vr];
        //         baseRegion = { r: variantRegion.r };
        //
        //         // Add subregions.
        //         if (variantRegion.sr) {
        //             baseRegion.sr = [];
        //             for (sr = 0; sr < variantRegion.sr.length; sr++)
        //                 baseRegion.sr.push({ r: variantRegion.sr[sr].r });
        //         }
        //
        //         // Add a SC marker, colour it, and put the default unit there.
        //         if (variantRegion.default) {
        //             baseRegion.sc = variantRegion.default.power;
        //
        //             // Default unit is in a subregion.
        //             if (variantRegion.default.sr) {
        //                 subregion = _.find(baseRegion.sr, 'r', variantRegion.default.sr);
        //                 subregion.unit = {
        //                     power: variantRegion.default.power,
        //                     type: variantRegion.default.type
        //                 };
        //             }
        //             else {
        //                 baseRegion.unit = {
        //                     power: variantRegion.default.power,
        //                     type: variantRegion.default.type
        //                 };
        //             }
        //         }
        //         else if (variantRegion.sc) { // Add an uncoloured SC marker.
        //             baseRegion.sc = null;
        //         }
        //
        //         regions.push(baseRegion);
        //     }
        //
        //     return regions;
        // };

    app.io.route('game', {
        userlist: function(req, res) {
            core.game.findByPlayer(req.data.playerID, function(err, games) {
                if (err) {
                    app.logger.error(err);
                    return res.status(400).json({ error: err });
                }

                return res.json(games);
            });
        },

        usergmlist: function(req, res) {
            core.game.findByGM(req.data.gmID, function(err, games) {
                if (err) {
                    app.logger.error(err);
                    return res.status(400).json({ error: err });
                }

                return res.json(games);
            });
        },

        get: function(req, res) {
            core.game.get(req.data.gameID, function(err, game) {
                if (err)
                    console.error(err);
                return res.json(game);
            });
        },

        listopen: function(req, res) {
            core.game.listOpen(function(err, games) {
                if (err)
                    console.error(err);
                return res.json(games);
            });
        },

        join: function(req, res) {
            var gameID = req.data.gameID,
                playerID = req.socket.decoded_token.id,
                // prefs = req.data.prefs,
                game,
                user,
                optionses = [];

            async.waterfall([
                function(callback) {
                    core.user.get(playerID, callback);
                },

                function(_user, callback) {
                    user = _user;
                    core.game.get(gameID, callback);
                },

                function(_game, callback) {
                    game = _game;
                    // Make sure this person is actually allowed to join.
                    if (game.minimumDedication > user.getDedication()) {
                        req.socket.emit('game:join:error', {
                            error: 'Your ' + user.getDedication() + '% dedication does not meet this game\'s minimum requirement of ' + game.minimumDedication + '% to join.'
                        });
                    }
                    else if (_.find(game.players, 'player_id', playerID)) {
                        req.socket.emit('game:join:error', {
                            error: 'You already are participating in this game.'
                        });
                    }

                    // Join.
                    game.addPlayer(user).nodeify(callback);
                },

                function(result, callback) {
                    var p,
                        gameData = { gamename: game.name };

                    // Subscribe to game.
                    req.socket.join(gameID);

                    // If everyone is here, signal the game can (re)start.
                    if (game.players.length === game.maxPlayers) {
                        req.io.route('game:start', { gameID: gameID });
                        return;
                    }

                    // Broadcast join to other subscribers.
                    req.socket.emit('game:join:success', gameData);
                    req.socket.broadcast.to(gameID).emit('game:join:announce', gameData);

                    // Send join alert email to other subscribers.
                    for (p = 0; p < game.players.length; p++) {
                        optionses.push({
                            subject: '[' + game.name + '] A new player has joined',
                            gameName: game.name,
                            personInflection: pluralize('person', game.maxPlayers - game.players.length),
                            playerCount: game.players.length,
                            email: game.players[p].email,
                            remainingSlots: game.maxPlayers - game.players.length
                        });
                    }
                    mailer.sendMany('join', optionses, callback);
                }
            ], function(err, result) {
                if (err) {
                    app.logger.error(err);
                    return res.status(400).json({ error: err });
                }

                return res.json('ok');
            });
        },

        leave: function(req, res) {
            var gameID = req.data.gameID,
                playerID = req.data.playerID,
                punish = req.data.punish;

            async.waterfall([
                // Toggle player's disabled flag.
                function(callback) {
                    core.game.disablePlayer(playerID, gameID, callback);
                },

                // Penalise players, if needed.
                function(game, callback) {
                    // Quitting is worth five 'latenesses'.
                    var penaltyValue = punish ? 5 : 0;
                    core.user.adjustActionCount(playerID, penaltyValue, callback);
                },

                function(game, callback) {
                    // Broadcast leave to others subscribed to game.
                    var userPower = game.getPlayerByID(playerID).power,
                        userPowerName = core.variant.get(game.variant).powers[userPower].name;

                    req.socket.broadcast.to(gameID).emit('game:leave:success', {
                        gamename: game.name,
                        power: userPowerName
                    });
                }
            ], function(err, game) {
                if (err)
                    app.logger.error(err);
            });
        },

        watch: function(req, res) {
            var userID = req.socket.decoded_token.id,
                watchedGames = 0;

            // Get list of subscribed games and join them as socket.io rooms.
            async.waterfall([
                // function(callback) {
                //     core.user.get(userID, callback);
                // },

                function(callback) {
                    core.game.findByPlayer(userID, callback);
                }
            ], function(err, games) {
                if (err)
                    app.logger.error(err);

                _.forEach(games, function(games) {
                    for (var g = 0; g < games.length; g++) {
                        req.socket.join(games[g].id);
                        watchedGames++;
                    }
                });

                app.logger.info(userID + ' now watching ' + watchedGames + ' room(s)');
            });
        },

        create: function(req, res) {
            var game = req.data.game;
            if (!game)
                throw new Error('No game data found.');

            core.game.create(req.socket.decoded_token.id, game, function(err, savedGame) {
                if (err) {
                    app.logger.error(err);
                }
                else {
                    app.logger.info(req.socket.decoded_token.id + ' joined game room ' + savedGame.id);
                    req.socket.join(savedGame.id);
                    app.io.in(savedGame.id).emit('game:create:success', { gamename: savedGame.name });
                }
            });
        },

        start: function(req, res) {
            app.logger.info('Starting game ' + req.data.gameID);

            async.waterfall([
                function(callback) {
                    core.game.start(app.queue, req.data.gameID, callback);
                },

                function(variant, game, callback) {
                    var optionses = [],
                        p;

                    for (p = 0; p < game.players.length; p++) {
                        optionses.push({
                            gameName: game.name,
                            gameURL: path.join(this.seekrits.get('domain'), 'games', game.id),
                            subject: '[' + game.name + '] The game is starting!',
                            deadline: game.currentPhase.deadline.format('dddd, MMMM Do [at] h:mm a'),
                            phase: game.currentPhase.phase,
                            year: game.currentPhase.year,
                            email: game.players[p].user.email,
                            powerDesignation: 'You have been selected to play ' + variant.powers[game.players[p].power].name +
                                ' in the game ' + game.name + '. You can start playing right now by visiting the game page at '
                        });
                    }

                    mailer.sendMany('gamestart', optionses, callback);
                }
            ], function(err) {
                if (err) {
                    app.logger(err);
                    res.status(400).json({ error: err });
                }
            });
        },

        // function(player, callback) {
        //         // app.logger.info('Player ' + player.user.email + ' assigned ' + player.power + ' in game ' + game.id);
        //         // Announce game start to room.
        //     });
        // },

        stop: function(req, res) {

        },

        end: function(req, res) {
            var gameID = req.data.gameID;

            async.waterfall([
                // Fetches the game to kill.
                function(callback) {
                    core.game.list({
                        gameID: gameID
                    }, function(err, games) { callback(err, games[0]); });
                },

                // Set game status to 2 (ended).
                function(game, callback) {
                    game.status = 2;
                    core.game.update(game, callback);
                },

                // Announce end to players.
                function(game, callback) {
                    async.each(game.players, function(player, eachCallback) {
                        async.waterfall([
                            function(wfCallback) {
                                core.user.list({ ID: player.player_id }, function(err, players) { wfCallback(err, players[0]); });
                            },

                            function(player, wfCallback) {
                                var emailOptions = {
                                    subject: '[' + game.name + '] GAME OVER!',
                                    gameName: game.name,
                                    email: player.email
                                };

                                mailer.sendOne('abort', emailOptions, wfCallback);
                            }
                        ], eachCallback);
                    }, function(err) { callback(err, game); });
                },

                function(game, callback) {
                    // Broadcast end to subscribers.
                    var gameData = { gamename: game.name };
                    req.socket.broadcast.to(gameID).emit('game:end:announce', gameData);
                }
            ], function(err) {
                if (err)
                    app.logger.error(err);
                else
                    return res.json({ status: 'ok' });
            });
        }
    });
};
