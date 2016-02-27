'use strict';

var _ = require('lodash'),
    async = require('async');

module.exports = function() {
    var app = this.app,
        core = this.core;

    app.io.route('season', {
        list: function(req, res) {
            var gameID = req.data.gameID,
                options = { gameID: gameID },
                userID = req.socket.decoded_token.id;

            /*
             * It's so likely the scheduling details of these seasons will come up,
             * they might as well be fetched now.
             */
            async.waterfall([
                function(callback) {
                    core.game.list(options, callback);
                },

                function(games, callback) {
                    core.season.list(options, function(err, seasons) {
                        callback(err, games[0], seasons);
                    });
                }],

                // Strip out movements the user shouldn't see.
                function(err, game, seasons) {
                    if (err)
                        console.error(err);

                    var r,
                        s,
                        season,
                        region,
                        isComplete = game.isComplete,
                        currentSeason = game.season,
                        currentYear = game.year,
                        playerPower = _.find(game.players, function(p) { return p.player_id.toString() === userID.toString(); }),
                        powerShortName;

                    if (playerPower)
                        powerShortName = playerPower.power;

                    for (s = 0; s < seasons.length; s++) {
                        season = seasons[s];

                        // Incomplete games and active seasons are sanitised for your protection.
                        if (!isComplete && (season.year === currentYear && season.season === currentSeason)) {
                            for (r = 0; r < season.regions.length; r++) {
                                region = season.regions[r];
                                if (region.unit && region.unit.power !== powerShortName)
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
                    console.log(err);
            });
        },

        setorder: function(req, res) {
            // TODO: Make sure order issuer actually owns the unit!

            async.waterfall([
                // Get relevant season.
                function(callback) {
                    core.season.setOrder(req.data.seasonID, req.data.command, req.data.action, callback);
                }
            ]);
        },

        toggleready: function(req, res) {
            var isReady = req.data.isReady,
                playerID = req.data.playerID,
                gameID = req.data.gameID;
            console.log('Player ' + playerID + ' has set ready flag to ' + isReady + ' in game ' + gameID);

            core.season.setReadyState(playerID, isReady, gameID, function(err, isEverybodyReady) {
                if (err)
                    console.log(err);

                // IS EVERYBODY READY?!
                if (isEverybodyReady) {
                    // TODO: Schedule near-immediate adjudication.
                }
            });
        }
    });
};
