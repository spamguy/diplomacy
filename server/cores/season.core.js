'use strict';

var db = require('./../db'),
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

SeasonCore.prototype.get = function(gameID, seasonIndex, year, cb) {
    var whereClause = {
        game_id: gameID
    };

    if (seasonIndex)
        whereClause.seasonIndex = seasonIndex;
    if (year)
        whereClause.year = year;
    db.models.Season.findOne({
        where: whereClause,
        order: [['created_at', 'DESC']],
        include: [{ model: db.models.SeasonProvince, as: 'provinces' }]
    }).nodeify(cb);
};

SeasonCore.prototype.create = function(season, cb) {
    var newSeason = db.models.Season.build(season);

    newSeason.save().nodeify(cb);
};

SeasonCore.prototype.createFromState = function(variant, game, season, state, cb) {
    // var SeasonSchema = mongoose.model('Season'),
    //     indexedRegions = _.indexBy(season.toObject().regions, 'r'),
    //     unit;
    //
    // async.waterfall([
    //     // STEP 1: Mark up old season, keeping orders intact for posterity.
    //     function(callback) {
    //         var u,
    //             resolution,
    //             resolutionParts;
    //
    //         // Move dislodged units from 'unit' to 'dislodged'.
    //         for (u in state.Dislodgeds()) {
    //             unit = state.Dislodgeds()[u];
    //             indexedRegions[u].dislodged = {
    //                 power: unit.Nation[0],
    //                 type: unit.Type === 'Fleet' ? 2 : 1
    //             };
    //             winston.debug('Marking %s:%s as dislodged', unit.Nation[0], u, { gameID: game.id.toString() });
    //         }
    //
    //         for (resolution in state.Resolutions()) {
    //             if (state.Resolutions()[resolution]) {
    //                 resolutionParts = resolution.split('/');
    //                 SeasonSchema.getUnitOwnerInRegion(indexedRegions[resolutionParts[0]]).unit.order.failed = true;
    //                 winston.debug('Marking %s as failed', u, { gameID: game.id.toString() });
    //             }
    //         }
    //
    //         mongoose.model('Season').findOneAndUpdate(
    //             { '_id': season.id },
    //             { '$set': {
    //                 'regions': _.values(indexedRegions)
    //             } },
    //             callback
    //         );
    //     },
    //
    //     // STEP 2: Create new season using state's list of units.
    //     function(season, callback) {
    //         var newSeason = SeasonSchema(),
    //             nextDeadline = moment(),
    //             regionIndex,
    //             unitIndex,
    //             rComponents,
    //             region,
    //             unit,
    //             godipUnit;
    //         newSeason.game_id = game.id;
    //
    //         // Wipe all units.
    //         for (regionIndex in indexedRegions) {
    //             region = SeasonSchema.getUnitOwnerInRegion(indexedRegions[regionIndex]);
    //             if (region)
    //                 delete region.unit;
    //         }
    //
    //         // Apply all units returned by godip.
    //         for (unitIndex in state.Units()) {
    //             godipUnit = state.Unit(unitIndex)[0];
    //             unit = {
    //                 type: godipUnit.Type === 'Fleet' ? 2 : 1,
    //                 power: godipUnit.Nation[0]
    //             };
    //             rComponents = unitIndex.split('/');
    //
    //             // Not in a subregion. Apply unit to topmost level.
    //             if (rComponents.length === 1) {
    //                 indexedRegions[rComponents[0]].unit = unit;
    //             }
    //             else {
    //                 // In a subregion. Apply it to the corresponding object in sr: [].
    //                 region = indexedRegions[rComponents[0]];
    //                 for (regionIndex = 0; regionIndex < region.sr.length; regionIndex++) {
    //                     if (region.sr[regionIndex].r === rComponents[1]) {
    //                         region.sr[regionIndex].unit = unit;
    //                         break;
    //                     }
    //                 }
    //             }
    //
    //             winston.debug('%s\'s unit set to %s:%s', unitIndex, unit.power, unit.type);
    //         }
    //
    //         nextDeadline.add(game.getClockFromSeason(game.season), 'hours');
    //         newSeason.deadline = nextDeadline;
    //         newSeason.regions = _.values(indexedRegions);
    //         newSeason.season = season.getNextSeasonSeason(variant);
    //         newSeason.year = season.getNextSeasonYear(variant);
    //
    //         // If no dislodges and no adjustments, skip this phase.
    //         if (_.contains(newSeason.season, 'Retreat') && _.isEmpty(state.Dislodgeds())) {
    //             winston.info('Skipping %s %s phase: no dislodged units', newSeason.season, newSeason.year, { gameID: game.id });
    //
    //             newSeason.season = season.getNextSeasonSeason(variant);
    //             newSeason.year = season.getNextSeasonYear(variant);
    //         }
    //
    //         newSeason.save(callback);
    //     },
    //
    //     function(season, callback) {
    //         game.season = season.season;
    //         game.year = season.year;
    //         game.save(callback);
    //     }
    // ], cb);
};

SeasonCore.prototype.setOrder = function(seasonID, data, action, cb) {
    var targetFullName = data[1],
        targetOfTargetFullName = data[2],
        splitTarget = targetFullName ? targetFullName.split('/') : null,
        splitTargetOfTarget = targetOfTargetFullName ? targetOfTargetFullName.split('/') : null,
        target = splitTarget ? splitTarget[0] : null,
        subTarget = splitTarget && splitTarget.length > 1 ? splitTarget[1] : null,
        targetOfTarget = splitTargetOfTarget ? splitTargetOfTarget[0] : null,
        subTargetOfTarget = splitTargetOfTarget && splitTargetOfTarget.length > 1 ? splitTargetOfTarget[1] : null;

    db.models.Season.update({
        unitAction: action,
        unitTarget: target,
        unitSubTarget: subTarget,
        unitTargetOfTarget: targetOfTarget,
        unitSubTargetOfTarget: subTargetOfTarget
    }).nodeify(cb);
};

module.exports = SeasonCore;
