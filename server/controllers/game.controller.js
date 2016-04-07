'use strict';

var path = require('path'),
    _ = require('lodash'),
    pluralize = require('pluralize'),
    async = require('async'),
    moment = require('moment'),
    mailer = require('../mailer/mailer');

module.exports = function() {
    var app = this.app,
        core = this.core,
        initRegions = function(variant) {
            var regions = [],
                vr,
                variantRegion,
                baseRegion,
                subregion,
                sr;

            for (vr = 0; vr < variant.regions.length; vr++) {
                variantRegion = variant.regions[vr];
                baseRegion = { r: variantRegion.r };

                // Add subregions.
                if (variantRegion.sr) {
                    baseRegion.sr = [];
                    for (sr = 0; sr < variantRegion.sr.length; sr++)
                        baseRegion.sr.push({ r: variantRegion.sr[sr].r });
                }

                // Add a SC marker, colour it, and put the default unit there.
                if (variantRegion.default) {
                    baseRegion.sc = variantRegion.default.power;

                    // Default unit is in a subregion.
                    if (variantRegion.default.sr) {
                        subregion = _.find(baseRegion.sr, 'r', variantRegion.default.sr);
                        subregion.unit = {
                            power: variantRegion.default.power,
                            type: variantRegion.default.type
                        };
                    }
                    else {
                        baseRegion.unit = {
                            power: variantRegion.default.power,
                            type: variantRegion.default.type
                        };
                    }
                }
                else if (variantRegion.sc) { // Add an uncoloured SC marker.
                    baseRegion.sc = null;
                }

                regions.push(baseRegion);
            }

            return regions;
        };

    app.io.route('game', {
        userlist: function(req, res) {
            var options = { playerID: req.data.playerID };
            core.game.list(options, function(err, games) {
                if (err)
                    console.error(err);
                return res.json(games);
            });
        },

        usergmlist: function(req, res) {
            var options = { gmID: req.data.gmID };
            core.game.list(options, function(err, games) {
                if (err)
                    console.error(err);
                return res.json(games);
            });
        },

        list: function(req, res) {
            var options = { gameID: req.data.gameID };
            core.game.list(options, function(err, games) {
                if (err)
                    console.error(err);
                return res.json(games);
            });
        },

        listopen: function(req, res) {
            core.game.listOpen({ }, function(err, games) {
                if (err)
                    console.error(err);
                return res.json(games);
            });
        },

        join: function(req, res) {
            var gameID = req.data.gameID,
                playerID = req.socket.decoded_token.id,
                prefs = req.data.prefs;

            core.user.list({ ID: playerID }, function(err, players) {
                if (err)
                    console.error(err);
                var player = players[0];

                core.game.list({ gameID: gameID }, function(err, games) {
                    if (err)
                        console.error(err);
                    var game = games[0],
                        newPlayer;

                    // Make sure this person is actually allowed to join.
                    if (game.minimumScoreToJoin > player.points) {
                        req.socket.emit('game:join:error', {
                            error: 'Your dedication score of ' + player.points + ' does not meet this game\'s minimum requirement of ' + game.minimumScoreToJoin + ' to join.'
                        });
                    }
                    else if (_.find(game.players, _.matchesProperty('player_id', playerID.toString()))) {
                        req.socket.emit('game:join:error', {
                            error: 'You already are participating in this game.'
                        });
                    }

                    // Join.
                    newPlayer = { player_id: playerID, isReady: false };
                    if (prefs)
                        newPlayer.prefs = prefs;
                    core.game.addPlayer(game, newPlayer, function(err, game) {
                        if (err)
                            console.log(err);

                        // Subscribe to game.
                        req.socket.join(gameID);

                        // If everyone is here, signal the game can (re)start.
                        if (game.players.length === game.maxPlayers) {
                            req.io.route('game:start', { gameID: gameID });
                        }
                        else {
                            // Send join alert email to other subscribers.
                            var emailOptions = {
                                    subject: '[' + game.name + '] A new player has joined',
                                    gameName: game.name,
                                    personInflection: pluralize('person', game.maxPlayers - game.players.length),
                                    playerCount: game.players.length,
                                    remainingSlots: game.maxPlayers - game.players.length
                                },
                                playerFetchCallback = function(err, user) {
                                    if (err)
                                        console.error(err);

                                    emailOptions.email = user[0].email;
                                    mailer.sendOne('join', emailOptions, function(err) {
                                        if (err)
                                            console.error(err);
                                    });
                                },
                                p,
                                gameData;

                            // Fetch email addresses of subscribed players.
                            // TODO: Rewrite with async.
                            for (p = 0; p < game.players.length; p++) {
                                core.user.list({
                                    ID: game.players[p].player_id
                                }, playerFetchCallback);
                            }

                            // Broadcast join to other subscribers.
                            gameData = { gamename: game.name };
                            req.socket.emit('game:join:success', gameData);
                            req.socket.broadcast.to(gameID).emit('game:join:announce', gameData);
                            return res.json({ status: 'ok' });
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
            var userID = req.socket.decoded_token.id,
                gameID = req.data ? req.data.gameID : null,
                watchedGames = 0;

            // Get list of subscribed games and join them as socket.io rooms.
            async.parallel([
                function(callback) {
                    core.game.list({
                        gameID: gameID,
                        playerID: userID
                    }, callback);
                },

                function(callback) {
                    if (userID) {
                        core.game.list({
                            gmID: userID
                        }, callback);
                    }
                    else {
                        // No need to filter by user.
                        callback(null, []);
                    }
                }
            ], function(err, gamesArray) {
                if (err)
                    console.error(err);

                _.forEach(gamesArray, function(games) {
                    for (var g = 0; g < games.length; g++) {
                        req.socket.join(games[g]._id);
                        watchedGames++;
                    }
                });

                console.log(userID + ' now watching ' + watchedGames + ' room(s)');
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
                    console.log(req.socket.decoded_token.id + ' joined game room ' + savedGame._id);
                    req.socket.join(savedGame._id);
                    app.io.in(savedGame._id).emit('game:create:success', { gamename: savedGame.name });
                }
            });
        },

        start: function(req, res) {
            var nextSeasonDeadline = moment();
            console.log('Starting game ' + req.data.gameID);

            async.waterfall([
                // Fetches the game to start.
                function(callback) {
                    core.game.list({
                        gameID: req.data.gameID
                    }, function(err, games) { callback(err, games[0]); });
                },

                // Fetches the game's most recent season, if there is one.
                function(game, callback) {
                    core.season.list({
                        gameID: game._id
                    }, function(err, seasons) {
                        if (err)
                            console.error(err);
                        callback(null, game, seasons);
                    });
                },

                // Creates first season if previous step pulled up nothing.
                function(game, seasons, callback) {
                    var variant = core.variant.get(game.variant),
                        clock,
                        defaultRegions,
                        firstSeason;
                    if (!seasons || !seasons.length) {
                        // Init regions.
                        defaultRegions = initRegions(variant);

                        // Create first season.
                        firstSeason = {
                            year: variant.startYear,
                            season: variant.seasons[0],
                            game_id: game._id,
                            regions: defaultRegions
                        };
                        clock = game.getClockFromSeason(firstSeason.season);
                        nextSeasonDeadline.add(clock, 'hours');
                        firstSeason.deadline = nextSeasonDeadline;

                        game.year = variant.startYear;
                        game.season = variant.seasons[0];
                        game.status = 1;

                        core.season.create(firstSeason, function(err, newSeason) { callback(err, variant, game, newSeason); });
                    }
                    else {
                        // Skip to next function.
                        callback(null, variant, game, seasons[0]);
                    }
                },

                // Assign powers to players.
                function(variant, game, season, callback) {
                    // TODO: Consider player preferences. See: http://rosettacode.org/wiki/Stable_marriage_problem
                    var shuffledSetOfPowers = _.shuffle(_.keys(variant.powers)),
                        shuffledSetIndex = 0,
                        p,
                        player;

                    for (p = 0; p < game.players.length; p++) {
                        player = game.players[p];

                        player.power = shuffledSetOfPowers[shuffledSetIndex];
                        console.log('Player ' + player.player_id + ' assigned ' + player.power + ' in game ' + game._id);
                        shuffledSetIndex++;
                    }

                    core.game.update(game, function(err, savedGame) { callback(err, variant, savedGame, season); });
                },

                // Schedule adjudication and send out emails.
                function(variant, game, season, callback) {
                    var job = app.queue.create('adjudicate', {
                        seasonID: season._id
                    });
                    job.delay(nextSeasonDeadline.toDate())
                        .attempts(1000) // TODO: Obviously, do not constantly retry in production.
                        .backoff({ delay: 'exponential' })
                        .save(function(err) {
                            if (err)
                                callback(err);
                        });

                    async.each(game.players, function(player, err) {
                        var emailOptions = {
                            gameName: game.name,
                            gameURL: path.join(app.seekrits.get('domain'), 'games', game._id.toString()),
                            subject: '[' + game.name + '] The game is starting!',
                            deadline: nextSeasonDeadline.format('dddd, MMMM Do [at] h:mm a'),
                            season: variant.seasons[season.season - 1],
                            year: season.year
                        };

                        core.user.list({ ID: player.player_id }, function(err, users) {
                            if (err)
                                console.error(err);
                            emailOptions.email = users[0].email;
                            // if (player.power === '*')
                            //    emailOptions.powerDesignation = 'You are the GM for this game. You can watch the action at ';
                            // else
                            emailOptions.powerDesignation = 'You have been selected to play ' + variant.powers[player.power].name + ' in the game ' + game.name + '. You can start playing right now by visiting the game page at ';
                            mailer.sendOne('gamestart', emailOptions, function(err) { console.error(err); });
                        });
                    });

                    // TODO: Email the GM too.
                }
            ]);
        },

        stop: function(req, res) {

        }
    });
};
