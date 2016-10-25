'use strict';

module.exports = {
    name: 'adjudicate',
    process: function(job, done) {
        var Promise = require('bluebird'),
            db = require('./server/db'),
            core = require('../cores/index'),
            winston = require('winston'),
            path = require('path'),
            seekrits = require('nconf')
                .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
                .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json')),
            mailer = require('../mailer/mailer'),
            gameID = job.data.gameID,
            // judgePath = path.join(seekrits.get('judgePath'), 'diplomacy-godip'),
            variant,
            game,
            phase;

        winston.log('Starting adjudication job', { gameID: gameID });

        db.bookshelf.transaction(function(t) {
            core.game.getAsync(gameID, t) // Fetches the game in question.
            .then(function(_game) {
                game = _game;
                variant = core.variant.get(game.get('variant'));

                // Not everyone is ready. Handling this situation deserves its own block.
                // FIXME: Drop 'false' when ignoreLateOrders is implemented.
                if (false && !game.get('ignoreLateOrders') && !game.isEverybodyReady()) { // eslint-disable-line
                    handleLatePhase();
                    throw new Error('Not adjudicating: some players are not ready');
                }

                return core.phase.get(gameID, null, t);
            })

            .then(function(_phase) {
                phase = _phase;
                core.phase.adjudicatePhase(variant, game, phase, t);
            })

            // Notify participants.
            .then(function(nextPhase) {
                var sendOneAsync = Promise.promisify(mailer.sendOne);
                return Promise.map(game.related('players'), function(junk, p) {
                    var player = game.related('players').at(p),
                        emailOptions = {
                            gameName: game.get('name'),
                            gameURL: path.join(seekrits.get('domain'), 'games', game.get('id')),
                            subject: '[' + game.get('name') + '] ' + phase.get('season') + ' ' + phase.get('year') + ' has been adjudicated',
                            deadline: phase.get('deadline'),
                            phase: phase.get('season'),
                            year: phase.get('year'),
                            nextPhase: nextPhase.getNextPhaseSeason(variant),
                            nextYear: nextPhase.getNextPhaseYear(variant)
                        };

                    core.user.get(player.pivot.get('user_id'), function(err, user) {
                        if (err)
                            winston.error(err);

                        emailOptions.email = user.get('email');
                        return sendOneAsync('adjudication', emailOptions);
                    });
                });
            })

            // Resets ready flag to false for all players.
            .then(function() {
                return core.game.resetAllReadyFlags(game);
            })

            .then(function() {
                return core.game.getAsync(gameID, t);
            })

            .catch(function(err) {
                winston.error(err);
                return done(err);
            });
        })
        .then(function() {
            return done(null, { game: game.toJSON({ obfuscate: true }), phase: phase.toJSON({ obfuscate: false }) });
        });
    }
};

function handleLatePhase() {

}
