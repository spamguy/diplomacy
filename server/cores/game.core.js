'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash'),
    NOT_STARTED = 0,
    STOPPED = 2;

function GameCore(options) {
    this.core = options.core;
}

GameCore.prototype.list = function(options, cb) {
    options = options || { };
    var Game = mongoose.model('Game'),
        query = Game.find(_.pick({
            '_id': options.gameID,
            'gm_id': options.gmID,
            'players.player_id': options.playerID,
            'status': options.status
        }, _.identity));

    query.exec(function(err, games) {
        if (err) {
            console.error(err);
            return cb(err);
        }

        cb(null, games);
    });
};

GameCore.prototype.listOpen = function(options, cb) {
    options = options || { };
    var Game = mongoose.model('Game'),
        query = Game.find({ status: { $in: [NOT_STARTED, STOPPED] } })
                    .where('this.players.length - 1 < this.maxPlayers');

    query.exec(function(err, games) {
        if (err) {
            console.error(err);
            return cb(err);
        }

        cb(null, games);
    });
};

GameCore.prototype.create = function(options, cb) {
    options = options || { };
    var newGame = mongoose.model('Game')({
        variant: options.variant,
        name: options.name,
        maxPlayers: options.maxPlayers,
        visibility: options.visibility,
        moveClock: options.move.clock,
        retreatClock: options.retreat.clock,
        adjustClock: options.adjust.clock,
        minimumScoreToJoin: options.minimumScoreToJoin,
        gm_id: options.gmID,
        players: [],
        status: 0
    });

    // Generate password hash.
    if (newGame.visibility === 'private') {
        // TODO: hash password as found in user:create
        newGame.passwordsalt = '';
        newGame.password = '';
    }

    newGame.save(function(err, data) { cb(err, data); });
};

/**
 * Updates an existing game.
 * @param  {Object}   game The game.
 * @param  {Function} cb   The callback after execution.
 */
GameCore.prototype.update = function(game, cb) {
    game.save(function(err, data) { cb(err, data); });
};

GameCore.prototype.addPlayer = function(game, player, cb) {
    mongoose.model('Game').update(
        { _id: game._id },
        { $push: { 'players': player } },
        { upsert: true },
        cb
    );
};

GameCore.prototype.resetReadyFlag = function(game, cb) {
    mongoose.model('Game').update(
        { _id: game._id },
        { $set: { 'players.isReady': false } },
        { },
        cb
    );
};

module.exports = GameCore;
