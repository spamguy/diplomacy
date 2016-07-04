'use strict';

var db = require('./../db'),
    async = require('async'),
    moment = require('moment'),
    _ = require('lodash');

function GameCore(options) {
    this.core = options.core;
}

GameCore.prototype.get = function(id, cb) {
    db.models.Game
        .where('id', id)
        .fetch({ withRelated: ['players', 'phases', 'phases.provinces'] })
        .asCallback(cb);
};

GameCore.prototype.findByGM = function(id, cb) {
    db.models.Game
        .where('gm_id', id)
        .fetchAll({ withRelated: ['players', {
            phases: function(query) {
                query.orderBy('created_at').limit(1);
            }
        }] })
        .asCallback(cb);
};

GameCore.prototype.findByPlayer = function(id, cb) {
    this.core.user.get(id, function(err, user) {
        if (err)
            cb(err, null);

        return cb(null, user.related('games'));
    });
};

GameCore.prototype.listOpen = function(cb) {
    db.models.Game
        .query(function(query) {
            query.select('g.*')
                .from('games AS g')
                .leftOuterJoin(function() {
                    this.select('game_id', db.bookshelf.knex.raw('coalesce(count(*), 0) as "player_count"'))
                        .from('game_players')
                        .groupBy('game_id')
                        .as('gp');
                }, 'gp.game_id', 'g.id')
                .where('player_count', '<', db.bookshelf.knex.raw('g.max_players'))
                .orWhereNull('player_count');
        })
        .fetchAll({ withRelated: ['players', {
            phases: function(query) {
                query.orderBy('created_at').limit(1);
            }
        }]})
        .asCallback(cb);
};

GameCore.prototype.create = function(gmID, options, cb) {
    var newGame = db.models.Game.build({
        variant: options.variant,
        name: options.name,
        description: options.description,
        maxPlayers: options.maxPlayers,
        visibility: options.visibility,
        moveClock: (options.move.days * 24) + options.move.hours + (options.move.minutes / 60),
        retreatClock: (options.retreat.days * 24) + options.retreat.hours + (options.retreat.minutes / 60),
        adjustClock: (options.adjust.days * 24) + options.adjust.hours + (options.adjust.minutes / 60),
        minimumScoreToJoin: options.minimumScoreToJoin,
        gm_id: gmID,
        status: 0
    });

    // Generate password hash.
    if (newGame.visibility === 'private') {
        // TODO: hash password as found in user:create
        newGame.passwordsalt = '';
        newGame.password = '';
    }

    // Get user to be GM.
    this.core.user.get(gmID, function(err, user) {
        if (err)
            cb(err, null);

        newGame.save().nodeify(cb);
    });
};

GameCore.prototype.setReadyFlag = function(gameID, userID, state, cb) {
    db.models.GamePlayer.update(
        { is_ready: state },
        { where: { game_id: gameID, user_id: userID } }
    ).nodeify(cb);
};

GameCore.prototype.resetAllReadyFlags = function(game, cb) {
    db.models.GamePlayer.update(
        { is_ready: false },
        { where: { game_id: game.id } }
    ).nodeify(cb);
};

/**
 * Sets a player's disabled status to true.
 * @param  {String}   playerID The player's ID.
 * @param  {String}   gameID   The game ID.
 * @param  {Function} cb       The callback.
 */
GameCore.prototype.disablePlayer = function(playerID, gameID, cb) {
    async.waterfall([
        function(callback) {
            this.get(gameID, callback);
        },

        function(_game, callback) {
            _.find(_game.players, 'player_id', playerID).setIsDisabled(true, callback);
        }
    ]);
};

GameCore.prototype.start = function(queue, gameID, cb) {
    var self = this,
        game; // Keep the correct scope in mind.
    db.bookshelf.transaction(function(t) {
        var phase,
            variant,
            nextPhaseDeadline = moment();

        async.waterfall([
            // Fetch the game to start.
            function(callback) {
                self.get(gameID, callback);
            },

            // Creates first phase if previous step pulled up nothing.
            function(_game, callback) {
                game = _game;
                variant = self.core.variant.get(game.get('variant'));

                if (!game.get('currentPhase')) {
                    nextPhaseDeadline.add(game.getClockFromPhase(variant.phases[0]), 'hours');
                    self.core.phase.initFromVariant(t, variant, game, nextPhaseDeadline, callback);
                }
                else {
                    callback(null, phase);
                }
            },

            // Link the new season and set the status to active. Do this last to conveniently pass game back to controller.
            function(_phase, callback) {
                phase = _phase;
                game.save({ status: 1 }, { transacting: t }).asCallback(callback);
            },

            // Assign powers to players.
            function(_game, callback) {
                game = _game;

                // TODO: Consider player preferences. See: http://rosettacode.org/wiki/Stable_marriage_problem
                var shuffledSetOfPowers = _.shuffle(_.keys(variant.powers));

                async.forEachOf(game.related('players'), function(player, p, eachCallback) {
                    game.related('players').updatePivot({ power: shuffledSetOfPowers[p] }, {
                        transacting: t,
                        query: { where: { user_id: game.related('players').at(p).get('id') } }
                    }).asCallback(eachCallback);
                }, callback);
            },

            // Schedule adjudication.
            function(callback) {
                var job = queue.create('adjudicate', {
                    phaseID: phase.get('id')
                });
                job.delay(nextPhaseDeadline.toDate())
                    .backoff({ delay: 'exponential' })
                    .save(callback);
            }

            // TODO: Email the GM too.
        ], function(err, result) {
            if (!err) {
                t.commit();
                self.get(gameID, cb);
            }
            else {
                t.rollback();
                cb(err);
            }
        });
    });
};

module.exports = GameCore;
