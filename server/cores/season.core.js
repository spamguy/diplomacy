'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment');

function SeasonCore(options) {
    this.core = options.core;
}

SeasonCore.prototype.list = function(options, cb) {
    options = options || { };
    var Season = mongoose.model('Season'),
        query = Season
            .find(_.pick({
                '_id': options.ID,
                'game_id': options.gameID,
                'year': options.year,
                'season': options.season
            }, _.identity))
            .sort({ 'createdAt': -1 });

    if (options.lean)
        query.lean();

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

SeasonCore.prototype.createFromState = function(variant, game, oldSeason, state, cb) {
    oldSeason = oldSeason.toObject();
    var indexedRegions = _.indexBy(oldSeason.regions, 'r'),
        unit,
        u;

    async.waterfall([
        function(callback) {
            // STEP 1: Mark up old season with outcomes.
            for (u in state.Dislodgeds()) {
                unit = state.Dislodgeds()[u];
                indexedRegions[u].dislodged = {
                    power: unit.Nation[0],
                    type: unit.Type === 'Fleet' ? 2 : 1
                };
            }

            mongoose.model('Season').findOneAndUpdate(
                { '_id': oldSeason._id },
                { '$set': {
                    'regions': _.values(indexedRegions)
                } },
                callback
            );
        },

        // STEP 2: Create new season using formatted old season.
        function(season, callback) {
            var newSeason = mongoose.model('Season')(),
                nextDeadline = moment();
            newSeason.game_id = game._id;

            nextDeadline.add(game.getClockFromSeason(game.season), 'hours');
            newSeason.deadline = nextDeadline;
            newSeason.season = season.getNextSeasonSeason(variant);
            newSeason.year = season.getNextSeasonYear(variant);

            newSeason.save(callback);
        },

        function(season, callback) {
            game.season = season.season;
            game.year = season.year;
            game.save(callback);
        }
    ], function(err) {
        if (err)
            console.error(err);
    });
};

SeasonCore.prototype.setOrder = function(seasonID, data, action, cb) {
    // FIXME: Set subregion orders in subregions and not at the region level.

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

    mongoose.model('Season').findOneAndUpdate({
        _id: seasonID,
        'regions.r': data[0]
    }, setCommand, { new: true }, cb);
};

module.exports = SeasonCore;
