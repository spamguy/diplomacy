'use strict';

module.exports = {
    name: 'adjudicate',
    process: function(job, done) {
        var core = require('../cores/index'),
            async = require('async'),
            winston = require('winston'),
            path = require('path'),
            seekrits = require('nconf')
                .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
                .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json')),
            mailer = require('../mailer/mailer'),
            seasonID = job.data.seasonID,
            judgePath = path.join(seekrits.get('judgePath'), 'diplomacy-godip');

        if (require('file-exists')(judgePath + '.js')) {
            require(judgePath);
        }
        else {
            winston.error('Could not adjudicate: no judge could be found at ' + judgePath);
            return;
        }

        async.waterfall([
            // Fetches the season in question.
            function(callback) {
                core.season.list({ ID: seasonID }, function(err, seasons) { callback(err, seasons[0]); });
            },

            // Fetches the game in question.
            function(season, callback) {
                core.game.list({ gameID: season.game_id }, function(err, games) { callback(err, games[0], season); });
            },

            // Verifies all players are ready. Fetches the variant, adjudicates, and persists the outcome.
            function(game, season, callback) {
                // Not everyone is ready. Handling this situation deserves its own block.
                if (!game.ignoreLateOrders && !game.isEverybodyReady) {
                    handleLateSeason();
                    callback(new Error('Not adjudicating: some players are not ready'));
                }

                var variant = core.variant.get(game.variant),
                    seasonObject = season.toObject(),
                    nextState;

                // Godip expects a season type.
                seasonObject.seasonType = seasonObject.season.split(' ')[1];

                nextState = global.state.NextFromJS(variant, seasonObject);
                core.season.createFromState(variant, game, season, nextState, function(err, s) { callback(err, variant, game, season, s); });
            },

            // Schedules next adjudication and notifies participants. Resets ready flag to false for all players.
            function(variant, game, oldSeason, newSeason, callback) {
                async.each(game.players, function(player, err) {
                    var emailOptions = {
                        gameName: game.name,
                        gameURL: path.join(seekrits.get('domain'), 'games', game._id.toString()),
                        subject: '[' + game.name + '] ' + oldSeason.season + ' ' + oldSeason.year + ' has been adjudicated',
                        deadline: oldSeason.deadline,
                        season: oldSeason.season,
                        year: oldSeason.year,
                        nextSeason: oldSeason.getNextSeasonSeason(variant),
                        nextYear: oldSeason.getNextSeasonYear(variant)
                    };

                    core.user.list({ ID: player.player_id }, function(err, users) {
                        if (err)
                            console.error(err);

                        emailOptions.email = users[0].email;
                        mailer.sendOne('adjudication', emailOptions, function(err) {
                            if (err)
                                winston.error(err);
                        });
                    });

                    core.game.resetAllReadyFlags(game, function(err, game) { callback(err, game, oldSeason); });
                });
            }
        ], function(err, game, oldSeason) {
            if (err)
                done(err);
            return done(null, {
                gameID: game._id,
                gameName: game.name,
                year: oldSeason.year,
                season: oldSeason.season
            });
        });
    }
};

function handleLateSeason() {

}
