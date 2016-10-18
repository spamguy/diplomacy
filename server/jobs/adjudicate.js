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
            game,
            phase;

        if (require('file-exists')(judgePath + '.js')) {
            require(judgePath);
        }
        else {
            winston.error('Could not adjudicate: no judge could be found at ' + judgePath);
            return;
        }

        winston.log('Starting adjudication job', { gameID: gameID });

        core.game.get(gameID, callback) // Fetches the game in question.
        .then(function(_game) {
            game = _game;
            variant = core.variant.get(game.get('variant'));

            // Not everyone is ready. Handling this situation deserves its own block.
            // FIXME: Drop 'false' when ignoreLateOrders is implemented.
            if (false && !game.get('ignoreLateOrders') && !game.isEverybodyReady()) { // eslint-disable-line
                handleLatePhase();
                callback(new Error('Not adjudicating: some players are not ready'));
                return;
            }

            core.phase.adjudicatePhase(variant, game, phase, t);
        })

        // Notify participants.
        .then(function(_phase) {
                phase = _phase;

                // FIXME: Next phase name missing.
                // FIXME: Deadline not human-readable.
                async.forEachOf(game.related('players'), function(junk, p, err) {
                    var player = game.related('players').at(p),
                        emailOptions = {
                            gameName: game.get('name'),
                            gameURL: path.join(seekrits.get('domain'), 'games', game.get('id')),
                            subject: '[' + game.get('name') + '] ' + oldPhase.get('season') + ' ' + oldPhase.get('year') + ' has been adjudicated',
                            deadline: oldPhase.get('deadline'),
                            phase: oldPhase.get('season'),
                            year: oldPhase.get('year'),
                            nextPhase: phase.getNextPhaseSeason(variant),
                            nextYear: phase.getNextPhaseYear(variant)
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
                return done(err);
            }

            return done(null, game.toJSON({ obfuscate: true }));
        });
    }
};

function handleLatePhase() {

}
