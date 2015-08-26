'use strict';

var _ = require('lodash'),
    pluralize = require('pluralize');

var seekrits;
try {
    seekrits = require('../config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
        seekrits = require('../config/local.env.sample');
}

var auth = require('../auth'),
    mailer = require('../mailer/mailer');

module.exports = function() {
    var app = this.app,
        core = this.core;

    app.io.route('game', {
        userlist: function(req, res) {
            var options = { playerID: req.data.playerID };
            var games = core.game.list(options, function(err, games) {
                return res.json(games);
            });
        },

        list: function(req, res) {
            var options = { gameID: req.data.gameID },
                games = core.game.list(options, function(err, games) {
                return res.json(games);
            });
        },

        listopen: function(req, res) {
            var games = core.game.listOpen({ }, function(err, games) {
                return res.json(games);
            });
        },

        join: function(req, res) {
            var gameID = req.data.gameID,
                playerID = req.socket.tokenData.id,
                prefs = req.data.prefs;

            core.user.list({ ID: playerID }, function(err, players) {
                var player = players[0];
                core.game.list({ gameID: gameID }, function(err, games) {
                    var game = games[0];
                    // make sure this person is actually allowed to join
                    if (game.minimumScoreToJoin > player.points)
                        req.socket.emit('game:join:error', {
                            error: 'Your dedication score of ' + player.points + ' does not meet this game\'s minimum requirement of ' + game.minimumScoreToJoin + ' to join.'
                        });
                    else if (_.find(game.players, _.matchesProperty('player_id', playerID.toString())))
                        req.socket.emit('game:join:error', {
                            error: 'You already are participating in this game.'
                        });

                    // join
                    var newPlayer = { player_id: playerID };
                    if (prefs)
                        newPlayer.prefs = prefs;
                    core.game.addPlayer(game, newPlayer, function(err) {
                        // subscribe to game
                        req.socket.join(gameID);

                        // if everyone is here, signal the game can (re)start
                        if (game.playerCount + 1 === game.maxPlayers) {
                            req.io.route('game:start', { gameID: gameID });
                        }
                        else {
                            /*
                             * Send join alert email to other subscribers.
                             * game.playerCount hasn't been updated yet, so manually add 1.
                             */
                            var emailOptions = {
                                subject: '[' + game.name + '] A new player has joined',
                                gameName: game.name,
                                personInflection: pluralize('person', game.maxPlayers - game.playerCount),
                                playerCount: game.playerCount + 1,
                                remainingSlots: game.maxPlayers - game.playerCount + 1
                            };

                            // fetch email addresses of subscribed players
                            // TODO: rewrite with async()
                            var playerFetchCallback = function(err, user) {
                                emailOptions.email = user[0].email;
                                mailer.sendOne('join', emailOptions, function(err) {
                                    if (err)
                                        console.error(err);
                                });
                            };
                            for (var p = 0; p < game.players.length; p++) {
                                core.user.list({
                                    ID: game.players[p].player_id
                                }, playerFetchCallback);
                            }

                            // broadcast join to other subscribers
                            var gameData = { gamename: game.name };
                            req.socket.emit('game:join:success', gameData);
                            req.socket.broadcast.to(gameID).emit('game:join:announce', gameData);
                        }
                    });
                });
            });
        },

        leave: function(req, res) {
            var gameID = req.data.gameID,
                game = core.game.list({ gameID: gameID });

            // mete out punishment to players leaving mid-game

            // broadcast leave to others subscribed to game
            req.socket.broadcast.to(gameID).emit('user:leave:success', { gamename: game.name });

            // signal the game should handle the situation
            req.socket.emit('game:stop', { gameID: gameID });
        },

        watch: function(req, res) {
            var userID = req.socket.tokenData.id,
                gameID = req.data ? req.data.gameID : null;

            // Get list of subscribed games and join them as socket.io rooms.
            core.game.list({
                gameID: gameID,
                playerID: userID,
                isActive: true
            }, function(err, games) {
                for (var g = 0; g < games.length; g++) {
                    req.socket.join(games[g]._id);
                    console.log(userID + ' joined game room ' + games[g]._id);
                }
            });
        },

        create: function(req, res) {
            var game = req.data.game;
            if (!game)
                throw new Error('No game data found.');

            core.game.create(game, function(err, savedGame) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log(req.socket.tokenData.id + ' joined game room ' + savedGame._id);
                    req.socket.join(savedGame._id);
                    app.io.in(savedGame._id).emit('game:create:success', { gamename: savedGame.name });
                }
            });
        },

        start: function(req, res) {
            console.log('Starting game ' + req.data.gameID);

            var isNew = false;

            core.game.list({
                gameID: req.data.gameID
            }, function(err, games) {
                var game = games[0],
                    variant = core.variant.get(game.variant);

                // Get most recent season, or create one if there isn't one.
                core.season.list({
                    gameID: req.data.gameID
                }, function(err, seasons) {
                    if (!seasons || seasons.length === 0) {
                        isNew = true;

                        /*
                         * Assign variant powers to player.
                         *
                         * TODO: Consider player preferences. See: http://rosettacode.org/wiki/Stable_marriage_problem
                         */
                        var shuffledSetOfPowers = _.shuffle(_.keys(variant.powers)),
                            shuffledSetIndex = 0;

                        for (var p = 0; p < game.players.length; p++) {
                            var player = game.players[p];

                            // Skip the GM.
                            if (player.power === '*')
                                continue;

                            player.power = shuffledSetOfPowers[shuffledSetIndex];
                            console.log('Player ' + player.player_id + ' assigned ' + player.power + ' in game ' + game._id);
                            shuffledSetIndex++;

                            // Notify player of power designation.
                        }
                    }
                    else {
                        // Notify everyone that game is restarting.
                    }

                    // Both new and old games: schedule adjudication.

                    // Save game changes.
                    console.log(game);
                    core.game.update(game, function() {
                        /*
                         * Generate first season object.
                         * This needs to be done last because we will not be returning to this event.
                         */
                        if (isNew) {
                            var firstSeason = {
                                year: variant.startYear,
                                season: 1,
                                game_id: req.data.gameID,
                                regions: variant.regions
                            };
                            req.io.route('season:create', { season: firstSeason });
                        }
                    });
                });
            });
        },

        stop: function(req, res) {

        }
    });
};
