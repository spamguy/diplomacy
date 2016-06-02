'use strict';

var db = require('./../db'),
    async = require('async'),
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

PhaseCore.prototype.initFromVariant = function(t, variant, game, deadline, cb) {
    var newPhase = db.models.Phase.build({
        year: variant.startYear,
        phase: variant.phases[0],
        game_id: game.id,
        deadline: deadline
    });

    async.waterfall([
        // Save new phase.
        function(callback) {
            newPhase.save({ transaction: t }).nodeify(cb);
        },

        // Generate region data for this phase, using variant template.
        function(phase, callback) {
            this.generatePhaseProvinces(t, variant, newPhase, true, callback);
        }
    ]);
};

/**
 * Bulk inserts provinces based on phase data or variant data.
 * @param  {Transaction} t           The transaction.
 * @param  {Object}      variant     The variant template.
 * @param  {Phase}       phase       The phase owning the new provinces.
 * @param  {Boolean}     useDefault  Whether to use variant info to set data.
 * @param  {Function}    cb          The callback.
 */
PhaseCore.prototype.generatePhaseProvinces = function(t, variant, phase, useDefault, cb) {
    var p,
        sp,
        provincesToInsert = [];

    for (p = 0; p < variant.provinces.length; p++) {
        provincesToInsert.push({
            phaseID: phase.id,
            provinceKey: variant.provinces[p].p,
            subProvinceKey: null
        });

        if (variant.provinces[p].sp) {
            for (sp = 0; sp < variant.provinces.length; sp++) {
                provincesToInsert.push({
                    phaseID: phase.id,
                    provinceKey: variant.provinces[p].p,
                    subProvinceKey: variant.provinces[p].sp[sp].p,
                    unitX: variant.provinces[p].sp[sp].x,
                    unitY: variant.provinces[p].sp[sp].y
                });
            }
        }
    }

    db.models.PhaseProvince.bulkCreate(provincesToInsert, { transaction: t }).nodeify(cb);
};

PhaseCore.prototype.createFromState = function(variant, game, phase, state, cb) {
    // var PhaseSchema = mongoose.model('Phase'),
    //     indexedProvinces = _.indexBy(phase.toObject().provinces, 'r'),
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
    //             indexedProvinces[u].dislodged = {
    //                 power: unit.Nation[0],
    //                 type: unit.Type === 'Fleet' ? 2 : 1
    //             };
    //             winston.debug('Marking %s:%s as dislodged', unit.Nation[0], u, { gameID: game.id.toString() });
    //         }
    //
    //         for (resolution in state.Resolutions()) {
    //             if (state.Resolutions()[resolution]) {
    //                 resolutionParts = resolution.split('/');
    //                 PhaseSchema.getUnitOwnerInProvince(indexedProvinces[resolutionParts[0]]).unit.order.failed = true;
    //                 winston.debug('Marking %s as failed', u, { gameID: game.id.toString() });
    //             }
    //         }
    //
    //         mongoose.model('Phase').findOneAndUpdate(
    //             { '_id': phase.id },
    //             { '$set': {
    //                 'provinces': _.values(indexedProvinces)
    //             } },
    //             callback
    //         );
    //     },
    //
    //     // STEP 2: Create new phase using state's list of units.
    //     function(phase, callback) {
    //         var newPhase = PhaseSchema(),
    //             nextDeadline = moment(),
    //             provinceIndex,
    //             unitIndex,
    //             rComponents,
    //             province,
    //             unit,
    //             godipUnit;
    //         newPhase.game_id = game.id;
    //
    //         // Wipe all units.
    //         for (provinceIndex in indexedProvinces) {
    //             province = PhaseSchema.getUnitOwnerInProvince(indexedProvinces[provinceIndex]);
    //             if (province)
    //                 delete province.unit;
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
    //             // Not in a subprovince. Apply unit to topmost level.
    //             if (rComponents.length === 1) {
    //                 indexedProvinces[rComponents[0]].unit = unit;
    //             }
    //             else {
    //                 // In a subprovince. Apply it to the corresponding object in sr: [].
    //                 province = indexedProvinces[rComponents[0]];
    //                 for (provinceIndex = 0; provinceIndex < province.sr.length; provinceIndex++) {
    //                     if (province.sr[provinceIndex].r === rComponents[1]) {
    //                         province.sr[provinceIndex].unit = unit;
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
    //         newPhase.provinces = _.values(indexedProvinces);
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
