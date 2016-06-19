'use strict';

var _ = require('lodash'),
    moment = require('moment'),
    pluralize = require('pluralize'),
    async = require('async'),
    path = require('path'),
    mailer = require('../mailer/mailer');

module.exports = function() {
    var app = this.app,
        core = this.core;
        // initProvinces = function(variant) {
        //     var provinces = [],
        //         vr,
        //         variantProvince,
        //         baseProvince,
        //         subprovince,
        //         sr;
        //
        //     for (vr = 0; vr < variant.provinces.length; vr++) {
        //         variantProvince = variant.provinces[vr];
        //         baseProvince = { r: variantProvince.r };
        //
        //         // Add subprovinces.
        //         if (variantProvince.sr) {
        //             baseProvince.sr = [];
        //             for (sr = 0; sr < variantProvince.sr.length; sr++)
        //                 baseProvince.sr.push({ r: variantProvince.sr[sr].r });
        //         }
        //
        //         // Add a SC marker, colour it, and put the default unit there.
        //         if (variantProvince.default) {
        //             baseProvince.sc = variantProvince.default.power;
        //
        //             // Default unit is in a subprovince.
        //             if (variantProvince.default.sr) {
        //                 subprovince = _.find(baseProvince.sr, 'r', variantProvince.default.sr);
        //                 subprovince.unit = {
        //                     power: variantProvince.default.power,
        //                     type: variantProvince.default.type
        //                 };
        //             }
        //             else {
        //                 baseProvince.unit = {
        //                     power: variantProvince.default.power,
        //                     type: variantProvince.default.type
        //                 };
        //             }
        //         }
        //         else if (variantProvince.sc) { // Add an uncoloured SC marker.
        //             baseProvince.sc = null;
        //         }
        //
        //         provinces.push(baseProvince);
        //     }
        //
        //     return provinces;
        // };

    app.io.route('game', {
        userlist: function(req, res) {
            core.game.findByPlayer(req.data.playerID, function(err, games) {
                if (err) {
                    app.logger.error(err);
                    return res.status(400).json({ error: err });
                }

                return res.json(games.toJSON({ currentUserID: req.socket.decoded_token.id }));
            });
        },

        usergmlist: function(req, res) {
            core.game.findByGM(req.data.gmID, function(err, games) {
                if (err) {
                    app.logger.error(err);
                    return res.status(400).json({ error: err });
                }

                return res.json(games.toJSON({ currentUserID: req.socket.decoded_token.id }));
            });
        },

        get: function(req, res) {
            core.game.get(req.data.gameID, function(err, game) {
                if (err)
                    console.error(err);
                return res.json(game.toJSON({ currentUserID: req.socket.decoded_token.id }));
            });
        },

        listopen: function(req, res) {
            core.game.listOpen(function(err, games) {
                if (err)
                    console.error(err);
                return res.json(games.toJSON({ currentUserID: req.socket.decoded_token.id }));
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
                    game.related('players').attach({
                        user_id: user.get('id'),
                        game_id: game.get('id'),
                        power: '?',
                        created_at: new Date(),
                        updated_at: new Date()
                    }).asCallback(callback);
                },

                // Refresh game and associations.
                function(result, callback) {
                    core.game.get(game.id, callback);
                },

                function(_game, callback) {
                    game = _game;
                    var p,
                        gameData = { gamename: game.get('name') };

                    // Subscribe to game.
                    req.socket.join(gameID);

                    // If everyone is here, signal the game can (re)start.
                    if (game.related('players').length === game.get('maxPlayers')) {
                        req.io.route('game:start', { gameID: gameID });
                        return;
                    }

                    // Broadcast join to other subscribers.
                    req.socket.emit('game:join:success', gameData);
                    req.socket.broadcast.to(gameID).emit('game:join:announce', gameData);

                    // Send join alert email to other subscribers.
                    for (p = 0; p < game.related('players').length; p++) {
                        optionses.push({
                            subject: '[' + game.get('name') + '] A new player has joined',
                            gameName: game.get('name'),
                            personInflection: pluralize('person', game.get('maxPlayers') - game.related('players').length),
                            playerCount: game.related('players').length,
                            email: game.related('players').at(p).get('email'),
                            remainingSlots: game.get('maxPlayers') - game.related('players').length
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
                punish = req.data.punish,
                game;

            async.waterfall([
                function(callback) {
                    core.game.get(gameID, callback);
                },

                // Toggle player's disabled flag.
                function(_game, callback) {
                    game = _game;
                    core.game.disablePlayer(playerID, gameID, callback);
                },

                // Penalise players, if needed.
                function(callback) {
                    // Quitting is worth five 'latenesses'.
                    var penaltyValue = punish ? 5 : 0;
                    core.user.adjustActionCount(playerID, penaltyValue, callback);
                },

                // Broadcast leave to others subscribed to game.
                function(result, callback) {
                    var userPower = _.find(game.players, 'id', playerID).power,
                        userPowerName = core.variant.get(game.variant).powers[userPower].name;

                    req.socket.broadcast.to(gameID).emit('game:leave:success', {
                        gamename: game.name,
                        power: userPowerName
                    });

                    game.setStatus(2).nodeify(callback);
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
                function(callback) {
                    core.game.findByPlayer(userID, callback);
                }
            ], function(err, games) {
                if (err)
                    app.logger.error(err);

                games.each(function(game) {
                    req.socket.join(game.get('id'));
                    watchedGames++;
                });

                app.logger.info(userID + ' now watching ' + watchedGames + ' ' + pluralize('room', watchedGames));
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
            var variant;
            app.logger.info('Starting game ' + req.data.gameID);

            async.waterfall([
                function(callback) {
                    core.game.start(app.queue, req.data.gameID, callback);
                },

                function(game, callback) {
                    variant = core.variant.get(game.get('variant'));
                    app.logger.info('Players selected for game ' + game.get('id'),
                        game.related('players').map(function(v) { return _.pick(v, ['power', 'email']); }));
                    var optionses = [];

                    game.related('players').each(function(player) {
                        optionses.push({
                            gameName: game.get('name'),
                            gameURL: path.join(app.seekrits.get('domain'), 'games', game.id),
                            subject: '[' + game.get('name') + '] The game is starting!',
                            deadline: moment(game.related('phases').at(0).get('deadline')).format('dddd, MMMM Do [at] h:mm a'),
                            season: game.related('phases').at(0).get('season'),
                            year: game.related('phases').at(0).get('year'),
                            email: player.get('email'),
                            powerDesignation: 'You have been selected to play ' + variant.powers[player.pivot.get('power')].name +
                                ' in the game ' + game.get('name') + '. You can start playing right now by visiting the game page at '
                        });
                    });

                    // Broadcast start to subscribers.
                    req.socket.broadcast.to(game.get('id')).emit('game:start:announce', { gamename: game.get('name') });

                    mailer.sendMany('gamestart', optionses, callback);
                }
            ], function(err) {
                if (err) {
                    app.logger.error(err);
                    res.status(400).json({ error: err });
                }
            });
        },

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
