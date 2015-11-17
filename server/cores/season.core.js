'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash');

function SeasonCore(options) {
    this.core = options.core;
}

SeasonCore.prototype.list = function(options, cb) {
    options = options || { };
    var Season = mongoose.model('Season');
    var query = Season.find(_.pick({
        '_id': options.ID,
        'game_id': options.gameID,
        'year': options.year,
        'season': options.season
    }, _.identity));

    query.exec(function(err, seasons) {
        if (err) {
            console.error(err);
            return cb(err);
        }

        cb(null, seasons);
    });
};

SeasonCore.prototype.create = function(season, cb) {
    var newSeason = mongoose.model('Season')(season);

    newSeason.save(function(err, data) { cb(err, data); });
};

SeasonCore.prototype.createFromState = function(variant, game, state, cb) {
    var newSeason = mongoose.model('Season')();

    newSeason.game_id = game._id;
    newSeason.moves = variant.regions;

    newSeason.save(function(err, data) { cb(err, data); });
};

module.exports = SeasonCore;
