'use strict';

var _ = require('lodash'),
    db = require('./../db'),
    Promise = require('bluebird'),
    moment = require('moment');

function PhaseCore(core, logger) {
    this.core = core;
    this.logger = logger;
}

PhaseCore.prototype.get = function(gameID, offset, t) {
    var order = 'asc',
        options = {
            withRelated: [
                'provinces', {
                    game: function(query) {
                        query.select('id', 'gm_id', 'current_phase_id');
                    }
                }
            ]
        };

    if (t)
        options.transacting = t;

    // Null offset caused by visiting game's default state. Represents current phase.
    if (offset === null) {
        order = 'desc';
        offset = 0;
    }
    else {
        offset--;
    }

    return db.models.Phase
    .query(function(query) {
        query.orderBy('created_at', order)
        .where('game_id', gameID)
        .limit(1);

        if (offset > 0)
            query.offset(offset);
    })
    .fetch(options);
};

PhaseCore.prototype.initFromVariant = function(variant, game, deadline, t) {
    var self = this,
        newPhase = new db.models.Phase({
            year: variant.startYear,
            season: variant.phases[0],
            game_id: game.get('id'),
            deadline: deadline
        });

    // Save new phase.
    return newPhase.save(null, { transacting: t })
    .then(function(phase) {
        // Generate region data for this phase, using variant template.
        return self.generatePhaseProvincesFromTemplate(variant, phase, t);
    })
    .then(function() {
        return game.save({ currentPhaseId: newPhase.get('id') }, { transacting: t });
    })
    .then(function() {
        return self.core.phase.get(newPhase.get('game_id'), null, t);
    });
};

/**
 * Bulk inserts provinces based on variant data.
 * @param  {Object}      variant     The variant template.
 * @param  {Phase}       phase       The phase owning the new provinces.
 * @param  {Transaction} t           The transaction.
 * @return {Promise}                 The revised phase.
 */
PhaseCore.prototype.generatePhaseProvincesFromTemplate = function(variant, phase, t) {
    var CONCURRENCY = 5;
    // Iterate through all template provinces in parallel.
    // TODO: Break up this nested function hellhole.
    return Promise.map(variant.provinces, function(province) {
        // Insert the base province.
        var scOwner = province.default ? province.default.power : null,
            owner = province.default && !province.default.sp ? province.default.power : null;

        return new db.models.PhaseProvince({
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
        }).save(null, { transacting: t })
        .then(function(newProvince) {
            // Insert subprovinces, if any.
            return Promise.map(province.sp || [], function(sp) {
                return new db.models.PhaseProvince({
                    phaseID: phase.get('id'),
                    provinceKey: province.p,
                    subprovinceKey: sp.p,
                    unitLocation: '(' + sp.x + ',' + sp.y + ')',
                    unitType: province.default && province.default.sp === sp.p ? province.default.type : null,
                    unitOwner: province.default && province.default.sp === sp.p ? province.default.power : null
                }).save(null, { transacting: t });
            }, { concurrency: CONCURRENCY });
        });
    }, { concurrency: CONCURRENCY });
};

/**
 * Bulk inserts provinces based on state data.
 * @param  {Object}      variant     The variant template.
 * @param  {Object}      state       The Godip state.
 * @param  {Phase}       phase       The phase owning the new provinces.
 * @param  {Transaction} t           The transaction.
 * @param  {Promise}                 The query's promise.
 */
PhaseCore.prototype.generatePhaseProvincesFromState = function(variant, state, phase, t) {
    var supplyCentres = state.SupplyCenters(),
        units = state.Units(),
        dislodgeds = state.Dislodgeds(),
        CONCURRENCY = 5;

    // Iterate through all template provinces in parallel.
    // TODO: Break up this nested function hellhole.
    return Promise.map(variant.provinces, function(province) {
        var supplyCentre = supplyCentres[province.p],
            unit = units[province.p],
            dislodgedUnit = dislodgeds[province.p];

        // Use state info instead of template whenever possible.
        return new db.models.PhaseProvince({
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
            dislodgedFill: dislodgedUnit ? variant.powers[dislodgedUnit.Nation[0]].colour : null,
            dislodgedType: dislodgedUnit ? convertGodipUnitType(dislodgedUnit.Type) : null,
            dislodgedOwner: dislodgedUnit ? dislodgedUnit.Nation[0] : null,
            resolution: null
        }).save(null, { transacting: t })
        .then(function(newProvince) {
            // Insert subprovinces, if any.
            return Promise.map(province.sp || [], function(sp) {
                var fullProvinceKey = province.p + '/' + sp.p,
                    unit = units[fullProvinceKey],
                    dislodgedUnit = dislodgeds[fullProvinceKey];

                return new db.models.PhaseProvince({
                    phaseID: phase.get('id'),
                    provinceKey: province.p,
                    subprovinceKey: sp.p,
                    unitLocation: '(' + sp.x + ',' + sp.y + ')',
                    unitType: unit ? convertGodipUnitType(unit.Type) : null, // province.default && province.default.sp === sp.p ? province.default.type : null,
                    unitOwner: unit ? unit.Nation[0] : null,
                    dislodgedFill: dislodgedUnit ? variant.powers[dislodgedUnit.Nation[0]].colour : null,
                    dislodgedType: dislodgedUnit ? convertGodipUnitType(dislodgedUnit.Type) : null,
                    dislodgedOwner: dislodgedUnit ? dislodgedUnit.Nation[0] : null,
                    resolution: null
                }).save(null, { transacting: t });
            }, { concurrency: CONCURRENCY });
        });
    }, { concurrency: CONCURRENCY });
};

PhaseCore.prototype.createFromState = function(variant, game, state, t) {
    var self = this,
        currentPhase,
        nextSeasonIndex,
        failedResolutions = _.omitBy(state.Resolutions(), function(r) { return r === ''; }),
        nextSeason,
        nextDeadline,
        nextPhase;

    // STEP 1: Get current phase.
    return self.get(game.get('id'), null, t)

    // STEP 2: Mark up old phase with resolution data, keeping orders intact for posterity.
    .then(function(phase) {
        currentPhase = phase;
        nextSeasonIndex = currentPhase.get('seasonIndex') + 1;

        // Retreat phases can be skipped if no retreats necessary.
        if (_.keys(state.Dislodgeds()).length === 0 && currentPhase.get('season').indexOf('Movement') > 0) {
            self.logger.log('Skipping retreat season', { gameID: game.get('id') });
            nextSeasonIndex++;
        }

        nextSeasonIndex = nextSeasonIndex % variant.phases.length;
        nextSeason = variant.phases[nextSeasonIndex];
        nextDeadline = moment().add(game.getClockFromSeason(nextSeason), 'hours');

        return Promise.props(_.mapValues(failedResolutions, function(resolution, key) {
            return self.setFailed(currentPhase, key, resolution, t);
        }));
    })
    .then(function() { // STEP 2: Mark up old phase with dislodged data.
        return Promise.props(_.mapValues(state.Dislodgeds(), function(resolution, key) {
            return self.setDislodged(variant, currentPhase.toJSON({ obfuscate: false }), key, getDislodgerProvince(state.Dislodgers(), key), t);
        }));
    })
    .then(function() { // STEP 3: Create new phase.
        nextPhase = new db.models.Phase({
            deadline: nextDeadline.toDate(),
            seasonIndex: nextSeasonIndex,
            season: nextSeason,
            year: currentPhase.get('year'),
            gameId: currentPhase.get('gameId')
        });

        // Phase rolled back to 0. Bump year.
        if (nextSeasonIndex < currentPhase.get('seasonIndex'))
            nextPhase.set('year', currentPhase.get('year') + 1);

        return nextPhase.save(null, { transacting: t, debug: true });
    })
    .then(function(_nextPhase) {
        nextPhase = _nextPhase;
        return game.save({ currentPhaseId: nextPhase.get('id') }, { transacting: t });
    })
    .then(function() {
        return self.generatePhaseProvincesFromState(variant, state, nextPhase, t);
    })
    .then(function() {
        if (nextPhase.get('season').indexOf('Adjustment') > -1)
            return self.syncSupplyCentreOwnership(nextPhase, t);
        else
            return Promise.resolve(nextPhase);
    });
};

PhaseCore.prototype.setOrder = function(phaseID, season, data, action, t) {
    var self = this,
        update,
        province = data[0].split('/'),
        subprovince = null,
        targetFullName = data[1],
        targetOfTargetFullName = data[2],
        splitTarget = targetFullName ? targetFullName.split('/') : null,
        splitTargetOfTarget = targetOfTargetFullName ? targetOfTargetFullName.split('/') : null,
        target = splitTarget ? splitTarget[0] : null,
        subTarget = splitTarget && splitTarget.length > 1 ? splitTarget[1] : null,
        targetOfTarget = splitTargetOfTarget ? splitTargetOfTarget[0] : null,
        subTargetOfTarget = splitTargetOfTarget && splitTargetOfTarget.length > 1 ? splitTargetOfTarget[1] : null,
        orderData;

    if (province[1])
        subprovince = province[1];

    if (season.indexOf('Retreat') > -1) {
        orderData = {
            'dislodged_action': action,
            'dislodged_target': target,
            'dislodged_subtarget': subTarget,
            'updated_at': new Date()
        };
    }
    else if (season.indexOf('Winter') > -1) {
        orderData = {
            unit_action: action,
            adjusted_unit_type: convertGodipUnitType(data[1]),
            updated_at: new Date()
        };

        this.logger.debug('Setting %s %s %s', data[0], action, data[1]);
    }
    else {
        orderData = {
            'unit_action': action,
            'unit_target': target,
            'unit_subtarget': subTarget,
            'unit_target_of_target': targetOfTarget,
            'unit_subtarget_of_target': subTargetOfTarget,
            'updated_at': new Date()
        };

        switch (action) {
        case 'hold':
            this.logger.debug('Setting %s hold', data[0]);
            break;
        case 'move':
            this.logger.debug('Setting %s -> %s', data[0], data[1]);
            break;
        case 'support':
            this.logger.debug('Setting %s support %s %s', data[0], data[1], data[2] ? '-> ' + data[2] : 'hold');
            break;
        case 'convoy':
            this.logger.debug('Setting %s convoy %s -> %s', data[0], data[1], data[2]);
            break;
        }
    }

    update = db.bookshelf.knex('phase_provinces')
        .where({
            'phase_id': phaseID,
            'province_key': province[0],
            'subprovince_key': subprovince
        });

    if (action !== 'build')
        update.whereNotNull('unit_owner');

    update.update(orderData);

    if (t)
        update.transacting(t).forUpdate();

    update.then(function(count) {
        if (count > 1)
            self.logger.warn('More than one province was updated');
        else if (count === 0)
            self.logger.warn('No provinces were updated');
    });

    return update;
};

/**
 * Marks a phase province's unit's order as dislodged.
 * @param  {Object}   variant   The variant.
 * @param  {Phase}    phase     The phase.
 * @param  {String}   province  The province key.
 * @param  {String}   dislodger The dislodging unit.
 * @param  {Transaction}   t    The transaction.
 * @return  {Promise}       The query's promise.
 */
PhaseCore.prototype.setDislodged = function(variant, phaseJSON, province, dislodger, t) {
    var provinceArray = province.split('/'),
        originalProvince = phaseJSON.provinces[province],
        updatedProvince = {
            phase_id: phaseJSON.id,
            province_key: provinceArray[0]
        },
        attackingUnitOwner;

    if (phaseJSON.provinces[dislodger].unit) {
        attackingUnitOwner = phaseJSON.provinces[dislodger].unit.owner;
    }
    else {
        this.logger.warn('Dislodger %s does not have a unit. Ignoring order');
        return Promise.resolve(0);
    }

    if (provinceArray[1])
        updatedProvince.subprovinceKey = provinceArray[1];

    this.logger.debug('Marking %s as dislodged by %s', province, dislodger, { phaseID: phaseJSON.id });

    // Bump current unit to dislodged slot.
    return db.bookshelf.knex('phase_provinces')
    .transacting(t)
    .forUpdate()
    .where(updatedProvince)
    .update({
        unit_owner: attackingUnitOwner,
        unit_fill: variant.powers[attackingUnitOwner].colour,
        dislodged_owner: originalProvince.unit.owner,
        dislodged_fill: originalProvince.unit.fill,
        dislodged_type: originalProvince.unit.type,
        dislodged_action: null
    });
};

/**
 * Marks a phase province's unit's order as failed.
 * @param  {Phase}   phase     The phase.
 * @param  {String}   province The province key.
 * @param  {Object}   resolution     The Godip-generated resolution.
 * @param  {Transaction}   t   The transaction.
 * @return  {Promise}       The query's promise.
 */
PhaseCore.prototype.setFailed = function(phase, province, resolution, t) {
    var readableResolution = convertGodipResolution(resolution),
        provinceArray = province.split('/'),
        provinceToUpdate = {
            phase_id: phase.get('id'),
            province_key: provinceArray[0]
        };

    if (provinceArray[1])
        provinceToUpdate.subprovince_key = provinceArray[1];

    this.logger.debug('Marking %s as failed (code %s)', province, resolution, { phaseID: phase.get('id') });

    return db.bookshelf.knex('phase_provinces')
    .transacting(t)
    .forUpdate()
    .where(provinceToUpdate)
    .update({
        resolution: readableResolution
    });
};

PhaseCore.prototype.setMovementPhaseDefaults = function(phase, t) {
    var self = this;
    return db.bookshelf.knex('phase_provinces')
    .transacting(t)
    .forUpdate()
    .debug(true)
    .where({
        phase_id: phase.get('id')
    })
    .whereNull('unit_action')
    .whereNotNull('unit_owner')
    .update({
        unit_action: 'hold'
    })
    .then(function() {
        return self.core.phase.get(phase.get('gameId'), null, t);
    });
};

PhaseCore.prototype.setRetreatPhaseDefaults = function(phase, t) {
    var self = this;
    return db.bookshelf.knex('phase_provinces')
    .transacting(t)
    .forUpdate()
    .debug(true)
    .where({
        phase_id: phase.get('id')
    })
    .whereNull('dislodged_action')
    .whereNotNull('dislodged_owner')
    .update({
        dislodged_action: 'disband'
    })
    .then(function() {
        return self.core.phase.get(phase.get('gameId'), null, t);
    });
};

PhaseCore.prototype.syncSupplyCentreOwnership = function(phase, t) {
    var self = this;
    return db.bookshelf.knex('phase_provinces')
    .transacting(t)
    .forUpdate()
    .debug(true)
    .where({
        phase_id: phase.get('id')
    })
    .whereNotNull('supply_centre_location')
    .whereNotNull('unit_owner')
    .update({
        supply_centre: db.bookshelf.knex.raw('unit_owner'),
        supply_centre_fill: db.bookshelf.knex.raw('unit_fill')
    })
    .then(function() {
        return self.core.phase.get(phase.get('gameId'), null, t);
    });
};

PhaseCore.prototype.adjudicatePhase = function(variant, game, phase, t) {
    var nextState,
        phaseJSON = phase.toJSON({ obfuscate: false }),
        key,
        convoyingProvince;

    // Flag which units are moving via convoy, because Godip insists.
    for (key in phaseJSON.provinces) {
        // Ignore non-moving units.
        if (!phaseJSON.provinces[key].unit)
            continue;
        if (phaseJSON.provinces[key].unit.action !== 'move') {
            phaseJSON.provinces[key].unit.isViaConvoy = false;
            continue;
        }

        // A unit is convoyed if another unit is ordered to convoy it specifically.
        convoyingProvince = _.find(phaseJSON.provinces, function(otherProvince, b) {
            return otherProvince.unit &&
                otherProvince.unit.action === 'convoy' &&
                otherProvince.unit.target === key;
        });
        phaseJSON.provinces[key].unit.isViaConvoy = !_.isUndefined(convoyingProvince);
    }

    phaseJSON.seasonType = phaseJSON.season.split(' ')[1];
    nextState = global.state.NextFromJS(variant, phaseJSON);
    debugger;

    return this.core.phase.createFromState(variant, game, nextState, t);
};

function convertGodipUnitType(godipType) {
    switch (godipType) {
    case null:
        return null;
    case 1:
    case 'Army':
        return 1;
    case 2:
    case 'Fleet':
        return 2;
    default:
        throw new Error('Unrecognised unit type \'' + godipType + '\' sent by Godip');
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
 * @param  {String} victim     The victim province's key.
 * @return {String}            The attacking province's key.
 */
function getDislodgerProvince(dislodgers, victim) {
    var dislodger = _.findKey(dislodgers, function(d) { return d === victim; });

    if (!dislodger)
        throw new Error('A unit dislodging ' + victim + ' was expected but not found');

    return dislodger;
}

module.exports = PhaseCore;
