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
            phaseID = job.data.phaseID,
            judgePath = path.join(seekrits.get('judgePath'), 'diplomacy-godip');

        if (require('file-exists')(judgePath + '.js')) {
            require(judgePath);
        }
        else {
            winston.error('Could not adjudicate: no judge could be found at ' + judgePath);
            return;
        }

        async.waterfall([
            // Fetches the phase in question.
            function(callback) {
                core.phase.list({ ID: phaseID }, function(err, phases) { callback(err, phases[0]); });
            },

            // Fetches the game in question.
            function(phase, callback) {
                core.game.list({ gameID: phase.game_id }, function(err, games) { callback(err, games[0], phase); });
            },

            // Verifies all players are ready. Fetches the variant, adjudicates, and persists the outcome.
            function(game, phase, callback) {
                // Not everyone is ready. Handling this situation deserves its own block.
                if (!game.ignoreLateOrders && !game.isEverybodyReady) {
                    handleLatePhase();
                    callback(new Error('Not adjudicating: some players are not ready'));
                }

                var variant = core.variant.get(game.variant),
                    phaseObject = phase.toObject(),
                    nextState;

                // Godip expects a phase type.
                phaseObject.phaseType = phaseObject.phase.split(' ')[1];

                nextState = global.state.NextFromJS(variant, phaseObject);
                core.phase.createFromState(variant, game, phase, nextState, function(err, s) { callback(err, variant, game, phase, s); });
            },

            // Schedules next adjudication and notifies participants. Resets ready flag to false for all players.
            function(variant, game, oldPhase, newPhase, callback) {
                async.each(game.players, function(player, err) {
                    var emailOptions = {
                        gameName: game.name,
                        gameURL: path.join(seekrits.get('domain'), 'games', game.id.toString()),
                        subject: '[' + game.name + '] ' + oldPhase.phase + ' ' + oldPhase.year + ' has been adjudicated',
                        deadline: oldPhase.deadline,
                        phase: oldPhase.phase,
                        year: oldPhase.year,
                        nextPhase: oldPhase.getNextPhasePhase(variant),
                        nextYear: oldPhase.getNextPhaseYear(variant)
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
                gameID: game.id,
                gameName: game.name,
                year: oldPhase.year,
                phase: oldPhase.phase
            });
        });
    }
};

function handleLatePhase() {

}
