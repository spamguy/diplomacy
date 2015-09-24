var async = require('async'),
    _ = require('lodash');

var seekrits;
try {
    seekrits = require('../config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
    seekrits = require('../config/local.env.sample');
}

var DiplomacyJudge = require('../judge/judge'),
    mailer = require('../mailer/mailer');

module.exports = function(agenda, core) {
    function handleLateSeason(game, season) {
        // TODO: Handle late seasons. Some games
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
                    newSeason = new DiplomacyJudge(variant).process(season);

                core.season.create(newSeason, function(err, s) { callback(err, variant, game, season); });
            },

            // Schedules next adjudication and notifies participants.
            function(variant, game, season, callback) {
                async.each(game.players, function(player, err) {
                    var emailOptions = {
                        gameName: game.name,
                        gameURL: seekrits.DOMAIN + '/games/' + game._id,
                        subject: '[' + game.name + '] The game is starting!',
                        deadline: job.nextRunAt,
                        season: variant.seasons[season.season - 1],
                        year: season.year
                    };

                    core.user.list({ ID: player.player_id }, function(err, users) {
                        emailOptions.email = users[0].email;
                        mailer.sendOne('adjudication', emailOptions, function(err) { });
                    });
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
