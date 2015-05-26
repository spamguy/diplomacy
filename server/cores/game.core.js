'use strict';

var mongoose = require('mongoose');

function GameCore(options) {
    this.core = options.core;
}

GameCore.prototype.create = function(provider, options, cb) {
    var Game = mongoose.model('Game');
    var game = new Game({ provider: provider });

    game.save(cb);
};

GameCore.prototype.list = function(provider, options, cb) {
    var Game = mongoose.model('Game');
    var query = Game.find({ });

    query.exec(function(err, games) {
        if (err) {
            console.error(err);
            return cb(err);
        }

        cb(null, games);
    });
};

module.exports = GameCore;
