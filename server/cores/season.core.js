'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash'),
    moment = require('moment');

function SeasonCore(options) {
    this.core = options.core;
}

SeasonCore.prototype.list = function(options, cb) {
    options = options || { };
    var Season = mongoose.model('Season'),
        query = Season.find(_.pick({
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
    var newSeason = mongoose.model('Season')(),
        nextDeadline = moment();

    newSeason.game_id = game._id;
    newSeason.regions = variant.regions;

    nextDeadline.add(game.getClockFromSeason(game.season), 'hours');
    newSeason.deadline = nextDeadline;

    newSeason.save(function(err, data) { cb(err, data); });
};

SeasonCore.prototype.setOrder = function(seasonID, data, action, cb) {
    var setCommand = {
        '$set': { }
    };

    if (action !== 'build') {
        setCommand.$set['regions.$.unit.order'] = {
            action: action
        };
        if (data[1])
            setCommand.$set['regions.$.unit.order'].y1 = data[1];
        if (data[2])
            setCommand.$set['regions.$.unit.order'].y2 = data[2];
    }
    else {
        // TODO: Build command.
    }

    console.log('Command to execute:');
    console.log(JSON.stringify(setCommand));

    mongoose.model('Season').findOneAndUpdate({
        _id: seasonID,
        'regions.r': data[0]
    }, setCommand, { new: true }, cb);
};

module.exports = SeasonCore;
