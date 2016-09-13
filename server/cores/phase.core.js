'use strict';

var _ = require('lodash'),
    db = require('./../db'),
    async = require('async'),
    winston = require('winston'),
    moment = require('moment');

// Log all the things.
winston.transports.Console.level = 'debug';

function PhaseCore(options) {
    options = options || { };
    if (options.core)
        this.core = options.core;
}

PhaseCore.prototype.initFromVariant = function(t, variant, game, deadline, cb) {
    var self = this,
        newPhase = new db.models.Phase({
            year: variant.startYear,
            season: variant.phases[0],
            game_id: game.get('id'),
            deadline: deadline
        });

    async.waterfall([
        // Save new phase.
        function(callback) {
            newPhase.save(null, { transacting: t }).asCallback(callback);
        },

        // Generate region data for this phase, using variant template.
        function(phase, callback) {
            newPhase = phase;
            self.generatePhaseProvincesFromTemplate(t, variant, phase, callback);
        }
    ], function(err, result) {
        if (err)
            cb(err, null);
        else
            cb(null, newPhase);
    });
};

/**
 * Bulk inserts provinces based on variant data.
 * @param  {Transaction} t           The transaction.
 * @param  {Object}      variant     The variant template.
 * @param  {Phase}       phase       The phase owning the new provinces.
 * @param  {Function}    cb          The callback.
 */
PhaseCore.prototype.generatePhaseProvincesFromTemplate = function(t, variant, phase, cb) {
    // Iterate through all template provinces in parallel.
    async.each(variant.provinces, function(province, eachCallback) {
        async.parallel([
            // Insert the base province.
            function(parallelCallback) {
                var scOwner = province.default ? province.default.power : null,
                    owner = province.default && !province.default.sp ? province.default.power : null;
                new db.models.PhaseProvince({
                    phaseID: phase.get('id'),
                    provinceKey: province.p,
                    subprovinceKey: null,
                    supplyCentre: scOwner,
                    supplyCentreLocation: province.sc ? '(' + province.sc.x + ',' + province.sc.y + ')' : null,
                    supplyCentreFill: province.sc && scOwner ? variant.powers[scOwner].colour : null,
                    unitFill: owner ? variant.powers[owner].colour : null,
                    unitType: province.default && !province.default.sp ? province.default.type : null,
                    unitOwner: owner,
                    unitLocation: '(' + province.x + ',' + province.y + ')'
                }).save(null, { transacting: t }).asCallback(parallelCallback);
            },

            // Insert subprovinces, if any.
            function(parallelCallback) {
                if (province.sp) {
                    async.each(province.sp, function(sp, eachEachCallback) {
                        new db.models.PhaseProvince({
                            phaseID: phase.get('id'),
                            provinceKey: province.p,
                            subprovinceKey: sp.p,
                            unitLocation: '(' + sp.x + ',' + sp.y + ')',
                            unitType: province.default && province.default.sp === sp.p ? province.default.type : null,
                            unitOwner: province.default && province.default.sp === sp.p ? province.default.power : null
                        }).save(null, { transacting: t }).asCallback(eachEachCallback);
                    }, parallelCallback);
                }
                else {
                    parallelCallback(null);
                }
            }
        ], eachCallback);
    }, cb);
};

/**
 * Bulk inserts provinces based on state data.
 * @param  {Transaction} t           The transaction.
 * @param  {Object}      variant     The variant template.
 * @param  {Object}      state       The Godip state.
 * @param  {Phase}       phase       The phase owning the new provinces.
 * @param  {Function}    cb          The callback.
 */
PhaseCore.prototype.generatePhaseProvincesFromState = function(t, variant, state, phase, cb) {
    var supplyCentres = state.SupplyCenters(),
        units = state.Units(),
        dislodgeds = state.Dislodgeds();

    async.each(variant.provinces, function(province, eachCallback) {
        // Iterate through all template provinces in parallel.
        async.parallel([
            // Use state info instead of template whenever possible.
            function(parallelCallback) {
                var supplyCentre = supplyCentres[province.p],
                    unit = units[province.p];
                new db.models.PhaseProvince({
                    phaseID: phase.get('id'),
                    provinceKey: province.p,
                    subprovinceKey: null,
                    supplyCentre: supplyCentre && supplyCentre !== 'Neutral' ? supplyCentre[0] : null,
                    supplyCentreLocation: province.sc ? '(' + province.sc.x + ',' + province.sc.y + ')' : null,
                    supplyCentreFill: supplyCentre && supplyCentre !== 'Neutral' ? variant.powers[supplyCentre[0]].colour : null,
                    unitFill: unit ? variant.powers[unit.Nation[0]].colour : null,
                    unitType: unit ? convertGodipUnitType(unit.Type) : null,
                    unitOwner: unit ? unit.Nation[0] : null,
                    unitLocation: '(' + province.x + ',' + province.y + ')',
                    isDislodged: dislodgeds[province.p],
                    resolution: null
                }).save(null, { transacting: t }).asCallback(parallelCallback);
            },

            // Insert subprovinces, if any.
            function(parallelCallback) {
                if (province.sp) {
                    async.each(province.sp, function(sp, eachEachCallback) {
                        var fullProvinceKey = province.p + '/' + sp.p,
                            unit = units[fullProvinceKey];

                        new db.models.PhaseProvince({
                            phaseID: phase.get('id'),
                            provinceKey: province.p,
                            subprovinceKey: sp.p,
                            unitLocation: '(' + sp.x + ',' + sp.y + ')',
                            unitType: unit ? convertGodipUnitType(unit.Type) : null, // province.default && province.default.sp === sp.p ? province.default.type : null,
                            unitOwner: unit ? unit.Nation[0] : null,
                            isDislodged: dislodgeds[province.p],
                            resolution: null
                        }).save(null, { transacting: t }).asCallback(eachEachCallback);
                    }, parallelCallback);
                }
                else {
                    parallelCallback(null);
                }
            }
        ], eachCallback);
    }, cb);
};

PhaseCore.prototype.createFromState = function(variant, game, state, cb) {
    var self = this,
        currentPhase = game.related('phases').at(0),
        currentPhaseJSON = currentPhase.toJSON(),
        nextSeasonIndex = currentPhase.get('seasonIndex') + 1,
        nextSeason,
        nextDeadline,
        nextPhase;

    // Retreat phases can be skipped if no retreats necessary.
    if (_.keys(state.Dislodgeds()).length === 0) {
        winston.log('Skipping retreat season', { gameID: game.get('id') });
        nextSeasonIndex++;
    }

    nextSeasonIndex = nextSeasonIndex % variant.phases.length;
    nextSeason = variant.phases[nextSeasonIndex];
    nextDeadline = moment().add(game.getClockFromSeason(nextSeason), 'hours');

    db.bookshelf.transaction(function(t) {
        async.waterfall([
            // STEP 1: Mark up old phase with resolution data, keeping orders intact for posterity.
            function(callback) {
                async.forEachOf(state.Resolutions(), function(resolution, key, cb) {
                    if (state.Resolutions()[key] !== '')
                        self.setFailed(currentPhase, key, resolution, t, cb);
                    else
                        cb();
                }, callback);
            },

            // STEP 2: Mark up old phase with dislodged data.
            function(callback) {
                async.forEachOf(state.Dislodgeds(), function(dislodged, key, cb) {
                    self.setFailed(variant, currentPhaseJSON, key, getDislodger(key), t, cb);
                }, callback);
            },

            // STEP 3: Create new phase.
            function(callback) {
                nextPhase = currentPhase.clone();
                nextPhase.unset('id');
                nextPhase.set('deadline', nextDeadline.toDate());
                nextPhase.set('seasonIndex', nextSeasonIndex);
                nextPhase.set('season', nextSeason);

                // Phase rolled back to 0. Bump year.
                if (nextSeasonIndex < currentPhase.get('seasonIndex'))
                    nextPhase.set('year', currentPhase.get('year') + 1);

                nextPhase.save(null, { transacting: t }).asCallback(callback);
            },

            // STEP 3: Create phase provinces from old state + resolutions.
            function(_nextPhase, callback) {
                nextPhase = _nextPhase;
                self.generatePhaseProvincesFromState(t, variant, state, nextPhase, callback);
            }
        ], function(err, result) {
            if (!err) {
                t.commit();
                self.core.game.get(game.get('id'), cb);
            }
            else {
                t.rollback();
                cb(err);
            }
        });
    });
};

PhaseCore.prototype.setOrder = function(phaseID, data, action, cb) {
    var province = data[0].split('/'),
        subprovince = null,
        targetFullName = data[1],
        targetOfTargetFullName = data[2],
        splitTarget = targetFullName ? targetFullName.split('/') : null,
        splitTargetOfTarget = targetOfTargetFullName ? targetOfTargetFullName.split('/') : null,
        target = splitTarget ? splitTarget[0] : null,
        subTarget = splitTarget && splitTarget.length > 1 ? splitTarget[1] : null,
        targetOfTarget = splitTargetOfTarget ? splitTargetOfTarget[0] : null,
        subTargetOfTarget = splitTargetOfTarget && splitTargetOfTarget.length > 1 ? splitTargetOfTarget[1] : null;

    if (province[1])
        subprovince = province[1];

    db.bookshelf.knex('phase_provinces')
        .where({
            'phase_id': phaseID,
            'province_key': province[0],
            'subprovince_key': subprovince
        })
        .update({
            'unit_action': action,
            'unit_target': target,
            'unit_subtarget': subTarget,
            'unit_target_of_target': targetOfTarget,
            'unit_subtarget_of_target': subTargetOfTarget,
            'updated_at': new Date()
        })
        .asCallback(cb);
};

/**
 * Marks a phase province's unit's order as dislodged.
 * @param  {Object}   variant   The variant.
 * @param  {Phase}    phase     The phase.
 * @param  {String}   province  The province key.
 * @param  {Object}   dislodger The dislodging unit.
 * @param  {Transaction}   t    The transaction.
 * @param  {Function} cb        The callback.
 */
PhaseCore.prototype.setDislodged = function(variant, phaseJSON, province, dislodger, t, cb) {
    var provinceArray = province.split('/'),
        originalProvince = phaseJSON.provinces[province],
        updatedProvince = {
            phaseID: phaseJSON.id,
            provinceKey: provinceArray[0]
        };

    if (provinceArray[1])
        updatedProvince.subprovinceKey = provinceArray[1];

    winston.debug('Marking %s as dislodged by %s', province, dislodger.Nation[0], { phaseID: phaseJSON.id });

    // Bump current unit to dislodged slot.
    new db.models.PhaseProvince(updatedProvince).save({
        unitOwner: dislodger.Nation[0],
        unitFill: variant.powers[dislodger.Nation[0]].colour,
        dislodgedOwner: originalProvince.unit.owner,
        dislodgedFill: originalProvince.unit.fill
    }, { patch: true, action: 'update' })
    .asCallback(cb);
};

/**
 * Marks a phase province's unit's order as failed.
 * @param  {Phase}   phase     The phase.
 * @param  {String}   province The province key.
 * @param  {Object}   resolution     The Godip-generated resolution.
 * @param  {Transaction}   t   The transaction.
 * @param  {Function} cb       The callback.
 */
PhaseCore.prototype.setFailed = function(phase, province, resolution, t, cb) {
    var readableResolution = convertGodipResolution(resolution),
        provinceArray = province.split('/'),
        provinceToUpdate = {
            phaseID: phase.get('id'),
            provinceKey: provinceArray[0]
        };

    if (provinceArray[1])
        provinceToUpdate.subprovinceKey = provinceArray[1];

    winston.debug('Marking %s as failed (code %s)', province, resolution, { phaseID: phase.get('id') });

    new db.models.PhaseProvince(provinceToUpdate).save(
        { resolution: readableResolution },
        { patch: true, action: 'update' })
    .asCallback(cb);
};

function convertGodipUnitType(godipType) {
    switch (godipType) {
    case 'Army': return 1;
    case 'Fleet': return 2;
    default: throw new Error('Unrecognised unit type \'' + godipType + '\' sent by Godip');
    }
}

/**
 * Maps Godip resolution codes to human-readable text.
 * @param  {[String} resolution The Godip resolution code.
 * @return {String}             A human-readable equivalent description.
 */
function convertGodipResolution(resolution) {
    // Split off extra info to make resolution codes more predictable.
    var resolutionParts = resolution.split(':'),
        code = resolutionParts[0],
        context = resolutionParts[1] ? resolutionParts[1] : null;

    switch (code) {
    case 'ErrBounce': return 'The unit bounced against ' + context;
    case 'ErrIllegalConvoyPath': return 'The convoy setup was not valid.';
    case 'ErrIllegalDestination': return 'The destination was unreachable from the unit\'s location.';
    default: return code;
    }
}

/**
 * Finds attacker, given the victim.
 * @param  {Object} dislodgers The attacker-victim dictionary.
 * @param  {String} province   The province's key.
 * @return {String}            The attacking province's key.
 */
function getDislodger(dislodgers, province) {
    return _.findKey(dislodgers, function(d) { return d === province; });
};

module.exports = PhaseCore;
