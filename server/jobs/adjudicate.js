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
            gameID = job.data.gameID,
            judgePath = path.join(seekrits.get('judgePath'), 'diplomacy-godip');

        if (require('file-exists')(judgePath + '.js')) {
            require(judgePath);
        }
        else {
            winston.error('Could not adjudicate: no judge could be found at ' + judgePath);
            return;
        }

        async.waterfall([
            // Fetches the game in question.
            function(phase, callback) {
                core.game.get(gameID, callback);
            },

            // Verifies all players are ready. Fetches the variant, adjudicates, and persists the outcome.
            function(game, callback) {
                // Not everyone is ready. Handling this situation deserves its own block.
                if (!game.get('ignoreLateOrders') && !game.isEverybodyReady()) {
                    handleLatePhase();
                    callback(new Error('Not adjudicating: some players are not ready'));
                }

                var variant = core.variant.get(game.variant),
                    phase = game.related('phases').at(0),
                    nextState;

                // Godip expects a phase type.
                phase.phaseType = phase.get('season').split(' ')[1];

                nextState = global.state.NextFromJS(variant, phase);
                core.phase.createFromState(variant, game, nextState, callback);
            },

            // Schedules next adjudication and notifies participants. Resets ready flag to false for all players.
            function(variant, game, oldPhase, newPhase, callback) {
                async.each(game.players, function(player, err) {
                    var emailOptions = {
                        gameName: game.get('name'),
                        gameURL: path.join(seekrits.get('domain'), 'games', game.get('id')),
                        subject: '[' + game.get('name') + '] ' + oldPhase.get('season') + ' ' + oldPhase.get('year') + ' has been adjudicated',
                        deadline: oldPhase.get('deadline'),
                        phase: oldPhase.get('season'),
                        year: oldPhase.get('year')
                        // nextPhase: oldPhase.getNextPhaseSeason(variant),
                        // nextYear: oldPhase.getNextPhaseYear(variant)
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

                    core.game.resetAllReadyFlags(game, function(err, game) { callback(err, game, oldPhase); });
                });
            }
        ], function(err, game, oldPhase) {
            if (err)
                done(err);
            return done(null, {
                gameID: game.get('id'),
                gameName: game.get('name'),
                year: oldPhase.get('year'),
                phase: oldPhase.get('season')
            });
        });
    }
};

function handleLatePhase() {

}
