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

            core.game.list(options, function(err, games) {
                var game = games[0],
                    isComplete = game.isComplete,
                    currentSeason = game.season,
                    currentYear = game.year,
                    playerPower = _.find(game.players, function(p) { return p.player_id.toString() === userID.toString(); }),
                    powerShortName = playerPower.power,
                    seasons = core.season.list(options, function(err, seasons) {
                        for (var s = 0; s < seasons.length; s++) {
                            var season = seasons[s];

                            // Incomplete games and active seasons are sanitised for your protection.
                            if (!isComplete && (season.year === currentYear && season.season === currentSeason)) {
                                for (var r = 0; r < season.regions.length; r++) {
                                    var region = season.regions[r];
                                    if (region.unit && region.unit.power !== powerShortName)
                                        delete region.unit.order;
                                }
                            }
                        }

                        return res.json(seasons);
                });
            });
        },

        create: function(req, res) {
            var season = req.data.season;

            core.season.create(season, function(err, savedSeason) {
                if (err)
                    console.log(err);
            });
        },

        setorder: function(req, res) {
            console.log('Setting order for season ' + req.data.seasonID);
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
