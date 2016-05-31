'use strict';

var db = require('./../db'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment'),
    winston = require('winston');

// Log all the things.
winston.transports.Console.level = 'debug';

function PhaseCore(options) {
    options = options || { };
    if (options.core)
        this.core = options.core;
}

PhaseCore.prototype.get = function(gameID, phaseIndex, year, cb) {
    var whereClause = {
        game_id: gameID
    };

    if (phaseIndex)
        whereClause.phaseIndex = phaseIndex;
    if (year)
        whereClause.year = year;
    db.models.Phase.findOne({
        where: whereClause,
        order: [['created_at', 'DESC']],
        include: [{ model: db.models.PhaseProvince, as: 'provinces' }]
    }).nodeify(cb);
};

PhaseCore.prototype.create = function(t, phase, cb) {
    var newPhase = db.models.Phase.build(phase);

    newPhase.save({ transaction: t }).nodeify(cb);
};

PhaseCore.prototype.createFromState = function(variant, game, phase, state, cb) {
    // var PhaseSchema = mongoose.model('Phase'),
    //     indexedRegions = _.indexBy(phase.toObject().regions, 'r'),
    //     unit;
    //
    // async.waterfall([
    //     // STEP 1: Mark up old phase, keeping orders intact for posterity.
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
    //                 PhaseSchema.getUnitOwnerInRegion(indexedRegions[resolutionParts[0]]).unit.order.failed = true;
    //                 winston.debug('Marking %s as failed', u, { gameID: game.id.toString() });
    //             }
    //         }
    //
    //         mongoose.model('Phase').findOneAndUpdate(
    //             { '_id': phase.id },
    //             { '$set': {
    //                 'regions': _.values(indexedRegions)
    //             } },
    //             callback
    //         );
    //     },
    //
    //     // STEP 2: Create new phase using state's list of units.
    //     function(phase, callback) {
    //         var newPhase = PhaseSchema(),
    //             nextDeadline = moment(),
    //             regionIndex,
    //             unitIndex,
    //             rComponents,
    //             region,
    //             unit,
    //             godipUnit;
    //         newPhase.game_id = game.id;
    //
    //         // Wipe all units.
    //         for (regionIndex in indexedRegions) {
    //             region = PhaseSchema.getUnitOwnerInRegion(indexedRegions[regionIndex]);
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
    //         nextDeadline.add(game.getClockFromPhase(game.phase), 'hours');
    //         newPhase.deadline = nextDeadline;
    //         newPhase.regions = _.values(indexedRegions);
    //         newPhase.phase = phase.getNextPhasePhase(variant);
    //         newPhase.year = phase.getNextPhaseYear(variant);
    //
    //         // If no dislodges and no adjustments, skip this phase.
    //         if (_.contains(newPhase.phase, 'Retreat') && _.isEmpty(state.Dislodgeds())) {
    //             winston.info('Skipping %s %s phase: no dislodged units', newPhase.phase, newPhase.year, { gameID: game.id });
    //
    //             newPhase.phase = phase.getNextPhasePhase(variant);
    //             newPhase.year = phase.getNextPhaseYear(variant);
    //         }
    //
    //         newPhase.save(callback);
    //     },
    //
    //     function(phase, callback) {
    //         game.phase = phase.phase;
    //         game.year = phase.year;
    //         game.save(callback);
    //     }
    // ], cb);
};

PhaseCore.prototype.setOrder = function(phaseID, data, action, cb) {
    var targetFullName = data[1],
        targetOfTargetFullName = data[2],
        splitTarget = targetFullName ? targetFullName.split('/') : null,
        splitTargetOfTarget = targetOfTargetFullName ? targetOfTargetFullName.split('/') : null,
        target = splitTarget ? splitTarget[0] : null,
        subTarget = splitTarget && splitTarget.length > 1 ? splitTarget[1] : null,
        targetOfTarget = splitTargetOfTarget ? splitTargetOfTarget[0] : null,
        subTargetOfTarget = splitTargetOfTarget && splitTargetOfTarget.length > 1 ? splitTargetOfTarget[1] : null;

    db.models.Phase.update({
        unitAction: action,
        unitTarget: target,
        unitSubTarget: subTarget,
        unitTargetOfTarget: targetOfTarget,
        unitSubTargetOfTarget: subTargetOfTarget
    }).nodeify(cb);
};

module.exports = PhaseCore;
