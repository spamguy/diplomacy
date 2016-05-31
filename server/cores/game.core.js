'use strict';

var db = require('./../db'),
    async = require('async'),
    moment = require('moment'),
    _ = require('lodash');

function GameCore(options) {
    this.core = options.core;
}

GameCore.prototype.get = function(id, cb) {
    db.models.Game.findOne({
        where: { id: id }/*,
        include: [{
            model: db.models.GamePlayer,
            as: 'players',
            include: [ db.models.User ]
        }, {
            model: db.models.Phase,
            as: 'currentPhase'
        }]*/
    }).nodeify(cb);
};

GameCore.prototype.findByGM = function(id, cb) {
    db.models.Game.findAll({
        where: { gm_id: id }/*,
        include: [{
            model: db.models.GamePlayer,
            as: 'players',
            include: [ db.models.User ]
        }, {
            model: db.models.Phase,
            as: 'currentPhase'
        }]*/
    }).nodeify(cb);
};

GameCore.prototype.findByPlayer = function(id, cb) {
    db.models.Game.findAll({
        /* include: [{
            model: db.models.GamePlayer,
            as: 'players',
            through: {
                where: {
                    user_id: id
                }
            },
            required: true
        }]*/
    }).nodeify(cb);
};

GameCore.prototype.listOpen = function(options, cb) {
    // options = options || { };
    // var Game = mongoose.model('Game'),
    //     query = Game.find({ status: { $in: [NOT_STARTED, STOPPED] } })
    //                 .where('this.players.length < this.maxPlayers');
    //
    // query.exec(function(err, games) {
    //     if (err) {
    //         console.error(err);
    //         return cb(err);
    //     }
    //
    //     cb(null, games);
    // });
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

/**
 * Updates an existing game.
 * @param  {Object}   game The game.
 * @param  {Function} cb   The callback after execution.
 */
GameCore.prototype.update = function(game, cb) {
    game.update().nodeify(cb);
};

GameCore.prototype.addPlayer = function(game, player, cb) {
    // mongoose.model('Game').findOneAndUpdate(
    //     { _id: game.id },
    //     { $push: { 'players': player } },
    //     { new: true },
    //     cb
    // );
};

GameCore.prototype.setReadyFlag = function(gameID, userID, state, cb) {
    // mongoose.model('Game').findOneAndUpdate(
    //     { _id: gameID, 'players.player_id': userID },
    //     { $set: { 'players.$.isReady': state } },
    //     { new: true },
    //     cb
    // );
};

GameCore.prototype.resetAllReadyFlags = function(game, cb) {
    // mongoose.model('Game').update(
    //     { _id: game.id },
    //     { $set: { 'players.isReady': false } },
    //     { },
    //     cb
    // );
};

/**
 * Sets a player's disabled status to true.
 * @param  {String}   playerID The player's ID.
 * @param  {String}   gameID   The game ID.
 * @param  {Function} cb       The callback.
 */
GameCore.prototype.disablePlayer = function(playerID, gameID, cb) {
    // mongoose.model('Game').findOneAndUpdate(
    //     { _id: gameID, 'players.player_id': playerID },
    //     { $set: { 'players.$.disabled': true } },
    //     { new: true },
    //     cb
    // );
};

GameCore.prototype.start = function(queue, gameID, cb) {
    db.sequelize.transaction(function(t) {
        var game,
            phase,
            variant = this.core.variant.get(game.variant),
            firstPhase,
            transaction,
            nextPhaseDeadline = moment();

        async.waterfall([
            // Fetch the game to start.
            function(callback) {
                this.get(gameID, callback);
            },

            // Start the transaction.
            function(_game, callback) {
                game = _game;
                db.sequelize.transaction().nodeify(cb);
            },

            // Creates first phase if previous step pulled up nothing.
            function(t, callback) {
                transaction = t;
                if (!game.currentPhase) {
                    nextPhaseDeadline.add(game.getClockFromPhase(variant.phases[0]), 'hours');

                    // Create first phase.
                    firstPhase = {
                        year: variant.startYear,
                        phase: variant.phases[0],
                        game_id: game.id,
                        deadline: nextPhaseDeadline
                    };
                    this.core.phase.create(t, firstPhase, callback);
                }
                else {
                    callback(null, phase);
                }
            },

            // Assign powers to players.
            function(_phase, callback) {
                phase = _phase;

                // TODO: Consider player preferences. See: http://rosettacode.org/wiki/Stable_marriage_problem
                var shuffledSetOfPowers = _.shuffle(_.keys(variant.powers)),
                    shuffledSetIndex = 0,
                    p,
                    player;

                for (p = 0; p < game.players.length; p++) {
                    player = game.players[p];
                    player.power = shuffledSetOfPowers[shuffledSetIndex];
                    shuffledSetIndex++;
                }

                async.each(game.players, function(player, eachCallback) {
                    player.save({ transaction: transaction }).nodeify(eachCallback);
                }, callback);
            },

            // Schedule adjudication.
            function(callback) {
                var job = queue.create('adjudicate', {
                    phaseID: phase.id
                });
                job.delay(nextPhaseDeadline.toDate())
                    .backoff({ delay: 'exponential' })
                    .save(callback);
            },

            // TODO: Email the GM too.

            // Link the new season and set the status to active. Do this last to conveniently pass game back to controller.
            function(callback) {
                game.current_phase_id = phase.id;
                game.status = 1;

                this.update(t, game, callback);
            }
        ], function(err, _game) {
            if (err) {
                transaction.rollback();
                cb(err, null);
            }
            else {
                transaction.commit();
                cb(null, _game);
            }
        });
    });
};

module.exports = GameCore;
