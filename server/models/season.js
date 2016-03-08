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

SeasonSchema.methods.getNextSeasonYear = function(variant) {
    if (variant.seasons.indexOf(this.season) === variant.seasons.length - 1)
        return this.year + 1;
    else
        return this.year;
};

SeasonSchema.methods.getNextSeasonSeason = function(variant) {
    var seasonIndex = variant.seasons.indexOf(this.season);
    return variant.seasons[seasonIndex % (variant.seasons.length - 1)];
};

module.exports = mongoose.model('Season', SeasonSchema);
