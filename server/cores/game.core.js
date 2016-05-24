'use strict';

var db = require('./../db'),
    _ = require('lodash'),
    NOT_STARTED = 0,
    STOPPED = 2;

function GameCore(options) {
    this.core = options.core;
}

GameCore.prototype.get = function(id, cb) {
    db.models.Game.findOne({
        where: { id: id },
        include: [{ model: db.models.User, as: 'Players' }]
    }).nodeify(cb);
};

GameCore.prototype.findByGM = function(id, cb) {
    db.models.Game.findAll({
        where: { gm_id: id }
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

GameCore.prototype.create = function(options, cb) {
    options = options || { };
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
        gmID: options.gmID,
        status: 0
    });

    // Generate password hash.
    if (newGame.visibility === 'private') {
        // TODO: hash password as found in user:create
        newGame.passwordsalt = '';
        newGame.password = '';
    }

    newGame.save().nodeify(cb);
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
    //     { _id: game._id },
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
    //     { _id: game._id },
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

module.exports = GameCore;
