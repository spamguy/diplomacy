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
            judgePath = path.join(seekrits.get('judgePath'), 'diplomacy-godip'),
            variant,
            game;

        if (require('file-exists')(judgePath + '.js')) {
            require(judgePath);
        }
        else {
            winston.error('Could not adjudicate: no judge could be found at ' + judgePath);
            return;
        }

        winston.log('Starting adjudication job', { gameID: gameID });

        async.waterfall([
            // Fetches the game in question.
            function(callback) {
                core.game.get(gameID, callback);
            },

            // Verifies all players are ready. Fetches the variant, adjudicates, and persists the outcome.
            function(_game, callback) {
                game = _game;
                variant = core.variant.get(game.get('variant'));

                // Not everyone is ready. Handling this situation deserves its own block.
                // FIXME: Drop 'false' when ignoreLateOrders is implemented.
                if (false && !game.get('ignoreLateOrders') && !game.isEverybodyReady()) {
                    handleLatePhase();
                    callback(new Error('Not adjudicating: some players are not ready'));
                    return;
                }

                var phase = game.related('phases').at(0),
                    phaseJSON = phase.toJSON({ obfuscate: false }),
                    nextState;

                // Godip expects a season type.
                phaseJSON.seasonType = phase.get('season').split(' ')[1];

                nextState = global.state.NextFromJS(variant, phaseJSON);
                core.phase.createFromState(variant, game, nextState, callback);
            },

            // Schedules next adjudication and notifies participants.
            function(_game, callback) {
                game = _game;

                var oldPhase = game.related('phases').at(1);

                async.forEachOf(game.related('players'), function(junk, p, err) {
                    var player = game.related('players').at(p),
                        emailOptions = {
                            gameName: game.get('name'),
                            gameURL: path.join(seekrits.get('domain'), 'games', game.get('id')),
                            subject: '[' + game.get('name') + '] ' + oldPhase.get('season') + ' ' + oldPhase.get('year') + ' has been adjudicated',
                            deadline: oldPhase.get('deadline'),
                            phase: oldPhase.get('season'),
                            year: oldPhase.get('year')
                            // nextPhase: oldPhase.getNextPhaseSeason(variant),
                            // nextYear: oldPhase.getNextPhaseYear(variant)
                        };

                    core.user.get(player.pivot.get('user_id'), function(err, user) {
                        if (err)
                            winston.error(err);

                        emailOptions.email = user.get('email');
                        mailer.sendOne('adjudication', emailOptions, callback);
                    });
                });
            },

            // Resets ready flag to false for all players.
            function(result, callback) {
                core.game.resetAllReadyFlags(game, callback);
            },

            function(result, callback) {
                core.game.get(gameID, callback);
            }
        ], function(err, game) {
            if (err) {
                winston.error(err);
                done(err);
            }

            return done(null, game.toJSON({ obfuscate: true }));
        });
    }
};

function handleLatePhase() {

}
