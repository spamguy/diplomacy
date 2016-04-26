var mongoose = require('mongoose'),
    timestamp = require('mongoose-timestamp'),
    OrderSchema = new mongoose.Schema({ }, { strict: false, _id: false }),
    SeasonSchema = new mongoose.Schema({
        game_id: mongoose.Schema.Types.ObjectId,
        year: Number,
        season: String,
        deadline: Date,
        regions: [ OrderSchema ]
    }, { useNestedStrict: true }); // See mongoose/mongoose in GitHub, ticket #3883.
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
