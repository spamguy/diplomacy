'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment'),
    winston = require('winston');

// Log all the things.
winston.transports.Console.level = 'debug';

function SeasonCore(options) {
    options = options || { };
    if (options.core)
        this.core = options.core;
}

SeasonCore.prototype.list = function(options, cb) {
    options = options || { };
    var Season = mongoose.model('Season'),
        seasonParts = options.season ? options.season.split('-') : null,
        seasonRegex = seasonParts
            ? new RegExp('^' + seasonParts[0] + '[-\s]*' + seasonParts[1], 'i')
            : null,
        query = Season
            .find(_.pick({
                '_id': options.ID,
                'game_id': options.gameID,
                'year': options.year,
                'season': seasonRegex
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

SeasonCore.prototype.createFromState = function(variant, game, season, state, cb) {
    var SeasonSchema = mongoose.model('Season'),
        indexedRegions = _.indexBy(season.toObject().regions, 'r'),
        unit;

    async.waterfall([
        // STEP 1: Mark up old season, keeping orders intact for posterity.
        function(callback) {
            var u,
                resolution,
                resolutionParts;

            // Move dislodged units from 'unit' to 'dislodged'.
            for (u in state.Dislodgeds()) {
                unit = state.Dislodgeds()[u];
                indexedRegions[u].dislodged = {
                    power: unit.Nation[0],
                    type: unit.Type === 'Fleet' ? 2 : 1
                };
                winston.debug('Marking %s:%s as dislodged', unit.Nation[0], u, { gameID: game._id.toString() });
            }

            for (resolution in state.Resolutions()) {
                if (state.Resolutions()[resolution]) {
                    resolutionParts = resolution.split('/');
                    SeasonSchema.getUnitOwnerInRegion(indexedRegions[resolutionParts[0]]).unit.order.failed = true;
                    winston.debug('Marking %s as failed', u, { gameID: game._id.toString() });
                }
            }

            mongoose.model('Season').findOneAndUpdate(
                { '_id': season._id },
                { '$set': {
                    'regions': _.values(indexedRegions)
                } },
                callback
            );
        },

        // STEP 2: Create new season using state's list of units.
        function(season, callback) {
            var newSeason = SeasonSchema(),
                nextDeadline = moment(),
                regionIndex,
                unitIndex,
                rComponents,
                region,
                unit,
                godipUnit;
            newSeason.game_id = game._id;

            // Wipe all units.
            for (regionIndex in indexedRegions) {
                region = SeasonSchema.getUnitOwnerInRegion(indexedRegions[regionIndex]);
                if (region)
                    delete region.unit;
            }

            // Apply all units returned by godip.
            for (unitIndex in state.Units()) {
                godipUnit = state.Unit(unitIndex)[0];
                unit = {
                    type: godipUnit.Type === 'Fleet' ? 2 : 1,
                    power: godipUnit.Nation[0]
                };
                rComponents = unitIndex.split('/');

                // Not in a subregion. Apply unit to topmost level.
                if (rComponents.length === 1) {
                    indexedRegions[rComponents[0]].unit = unit;
                }
                else {
                    // In a subregion. Apply it to the corresponding object in sr: [].
                    region = indexedRegions[rComponents[0]];
                    for (regionIndex = 0; regionIndex < region.sr.length; regionIndex++) {
                        if (region.sr[regionIndex].r === rComponents[1]) {
                            region.sr[regionIndex].unit = unit;
                            break;
                        }
                    }
                }

                winston.debug('%s\'s unit set to %s:%s', unitIndex, unit.power, unit.type);
            }

            nextDeadline.add(game.getClockFromSeason(game.season), 'hours');
            newSeason.deadline = nextDeadline;
            newSeason.regions = _.values(indexedRegions);
            newSeason.season = season.getNextSeasonSeason(variant);
            newSeason.year = season.getNextSeasonYear(variant);

            // If no dislodges and no adjustments, skip this phase.
            if (_.contains(newSeason.season, 'Retreat') && _.isEmpty(state.Dislodgeds())) {
                winston.info('Skipping %s %s phase: no dislodged units', newSeason.season, newSeason.year, { gameID: game._id });

                newSeason.season = season.getNextSeasonSeason(variant);
                newSeason.year = season.getNextSeasonYear(variant);
            }

            newSeason.save(callback);
        },

        function(season, callback) {
            game.season = season.season;
            game.year = season.year;
            game.save(callback);
        }
    ], cb);
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
            setCommand.$set['regions.$.unit.order'].source = data[1];
        if (data[2])
            setCommand.$set['regions.$.unit.order'].target = data[2];
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
