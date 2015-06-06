'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash');

function GameCore(options) {
    this.core = options.core;
}

GameCore.prototype.create = function(options, cb) {
    var Game = mongoose.model('Game');
    var game = new Game();

    game.save(cb);
};

GameCore.prototype.list = function(options, cb) {
    options = options || { };
    var Game = mongoose.model('Game');
    var query = Game.find(_.pick({
        '_id': options.ID,
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

module.exports = GameCore;
