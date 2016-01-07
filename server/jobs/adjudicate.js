var async = require('async'),
    path = require('path'),
    _ = require('lodash'),
    seekrits,
    DiplomacyJudge,
    mailer = require('../mailer/mailer');

try {
    seekrits = require('../config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
    seekrits = require('../config/local.env.sample');
}

DiplomacyJudge = require(path.join(seekrits.judgePath, 'diplomacy-godip'));

module.exports = function(agenda, core) {
    function handleLateSeason(game, season) {
        // TODO: Begin the grace period countdown.
        // TODO: Penalize late players.
    }

    // Define custom error type.
    function AllPlayersNotReadyError() { }

    agenda.define('adjudicate', function(job, done) {
        var seasonID = job.attrs.data.seasonID;

        console.log('Adjudicating season ' + seasonID);

        async.waterfall([
            // Fetches the season in question.
            function(callback) {
                core.season.list({ ID: seasonID }, function(err, seasons) { callback(err, seasons[0]); });
            },

            // Fetches the game in question.
            function(season, callback) {
                core.game.list({ ID: season.game_id }, function(err, games) { callback(err, games[0], season); });
            },

            // Verifies all players are ready. Fetches the variant, adjudicates, and persists the outcome.
            function(game, season, callback) {
                // Not everyone is ready. Handling this situation deserves its own block.
                if (!game.ignoreLateOrders && !_.every(game.players, 'isReady'))
                    throw new AllPlayersNotReadyError();

                var variant = core.variant.get(game.variant),
                    nextState = global.state.NextFromJS(variant, season);

                core.season.createFromState(variant, game, nextState, function(err, s) { callback(err, variant, game, season); });
            },

            // Schedules next adjudication and notifies participants. Resets ready flag to false for all players.
            function(variant, game, season, callback) {
                async.each(game.players, function(player, err) {
                    var emailOptions = {
                        gameName: game.name,
                        gameURL: seekrits.DOMAIN + '/games/' + game._id,
                        subject: '[' + game.name + '] ' + season.season + ' ' + season.year + ' has been adjudicated',
                        deadline: job.nextRunAt,
                        season: season.season,
                        year: season.year
                    };

                    core.user.list({ ID: player.player_id }, function(err, users) {
                        if (err)
                            console.error(err);

                        emailOptions.email = users[0].email;
                        mailer.sendOne('adjudication', emailOptions, function(err) {
                            if (err)
                                console.log(err);
                        });
                    });

                    core.game.resetReadyFlag(game, function(err, game) { callback(err, variant, game, season); });
                });
            }
        ], function(err, game, season) {
            if (!err)
                return;

            if (err instanceof AllPlayersNotReadyError)
                handleLateSeason(game, season);
        });

        return done();
    });
};
