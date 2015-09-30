'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash');

function GameCore(options) {
    this.core = options.core;
}

GameCore.prototype.list = function(options, cb) {
    options = options || { };
    var Game = mongoose.model('Game');
    var query = Game.find(_.pick({
        '_id': options.gameID,
        'players.player_id': options.playerID,
        'isActive': options.isActive
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
    var Game = mongoose.model('Game');
    var query = Game.find({ isActive: true })
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
        players: [{
                player_id: options.playerID,
                power: '*'
            }
        ],
        isActive: true
    });

    // generate password hash
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
