var _ = require('lodash'),
    mongoose = require('mongoose'),
    timestamp = require('mongoose-timestamp'),
    RegionSchema = require('./region'),
    SeasonSchema = new mongoose.Schema({
        game_id: mongoose.Schema.Types.ObjectId,
        year: Number,
        season: String,
        deadline: Date,
        regions: [ RegionSchema ]
    });
SeasonSchema.plugin(timestamp);

/**
 * Gets a unit's most precise location within a region.
 * @param  {Object} r     The region.
 * @param  {Integer} [type] The unit type by which to filter.
 * @param  {String} [power] The power by which to filter.
 * @return {Object}       The region or subregion with a unit present, or null.
 */
SeasonSchema.statics.getUnitOwnerInRegion = function(r, type, power) {
    var subregionWithUnit = _.find(r.sr, 'unit');

    if (r.unit && unitMatchesFilters(r.unit, type, power))
        return r;
    else if (subregionWithUnit && unitMatchesFilters(subregionWithUnit.unit, type, power))
        return subregionWithUnit;

    return null;
};

SeasonSchema.statics.getRegionNameForUnit = function(r) {
    // Unit is in non-subregion.
    if (!r.sr && r.unit)
        return r.r;

    for (var sr = 0; sr < r.sr.length; sr++) {
        // Unit is in subregion.
        if (r.sr[sr].unit)
            return r.r + '/' + r.sr[sr].r;
    }

    // No unit.
    return null;
};

SeasonSchema.methods.getNextSeasonYear = function(variant) {
    if (variant.seasons.indexOf(this.season) === variant.seasons.length - 1)
        return this.year + 1;
    else
        return this.year;
};

SeasonSchema.methods.getNextSeasonSeason = function(variant) {
    var seasonIndex = variant.seasons.indexOf(this.season);
    return variant.seasons[(seasonIndex + 1) % (variant.seasons.length - 1)];
};

function unitMatchesFilters(unit, type, power) {
    return (!type || unit.type === type) && (!power || unit.power === power);
}

module.exports = mongoose.model('Season', SeasonSchema);
