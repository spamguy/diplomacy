'use strict';

var db = require('./../db'),
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
                    supplyCentreFill: province.sc && scOwner ? variant.powers[owner].colour : null,
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
        dislodgeds = state.Dislodgeds(),
        faileds = state.Resolutions(); // Resolutions() is only used for identifying failed moves, hence 'faileds'.

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
                    isFailed: faileds[province.p]
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
                            isFailed: faileds[province.p]
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
        nextSeasonIndex = (currentPhase.get('seasonIndex') + 1) % variant.phases.length,
        nextSeason = variant.phases[nextSeasonIndex],
        nextDeadline = moment().add(game.getClockFromSeason(nextSeason), 'hours'),
        nextPhase;
    db.bookshelf.transaction(function(t) {
        async.waterfall([
            // STEP 1: Mark up old phase, keeping orders intact for posterity.
            function(callback) {
                async.forEachOf(state.Resolutions(), function(resolution, key, cb) {
                    if (state.Resolutions()[resolution])
                        self.setFailed(currentPhase, resolution, key, cb);
                }, callback);
            },

            // STEP 2: Create new phase.
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
 * Marks a phase province's sitting unit as dislodged.
 * @param  {Phase}   phase     The phase.
 * @param  {String}   province The province key.
 * @param  {Object}   unit     The Godip-generated unit.
 * @param  {Transaction}   t   The transaction.
 * @param  {Function} cb       The callback.
 */
PhaseCore.prototype.setDislodged = function(phase, province, unit, t, cb) {
    var provinceArray = province.split('/'),
        provinceToUpdate = {
            phaseID: phase.get('id'),
            unitOwner: unit.Nation[0],
            provinceKey: provinceArray[0]
        };

    if (provinceArray[1])
        provinceToUpdate.subprovinceKey = provinceArray[1];

    winston.debug('Marking %s:%s as dislodged', province, unit.Nation[0], { phaseID: phase.get('id') });

    new db.models.PhaseProvince(provinceToUpdate).save('is_dislodged', true).asCallback(cb);
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
    var provinceArray = province.split('/'),
        provinceToUpdate = {
            phaseID: phase.get('id'),
            unitOwner: resolution.Nation[0],
            provinceKey: provinceArray[0]
        };

    if (provinceArray[1])
        provinceToUpdate.subprovinceKey = provinceArray[1];

    winston.debug('Marking %s:%s as failed', province, resolution.Nation[0], { phaseID: phase.get('id') });

    new db.models.PhaseProvince(provinceToUpdate).save('is_failed', true).asCallback(cb);
};

function convertGodipUnitType(godipType) {
    switch (godipType) {
    case 'Army': return 1;
    case 'Fleet': return 2;
    default: throw new Error('Unrecognised unit type \'' + godipType + '\' sent by Godip');
    }
}

module.exports = PhaseCore;
