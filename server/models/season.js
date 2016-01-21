var mongoose = require('mongoose'),
    timestamp = require('mongoose-timestamp');

var OrderSchema = new mongoose.Schema({
}, { strict: false, _id: false });

var SeasonSchema = new mongoose.Schema({
    game_id: mongoose.Schema.Types.ObjectId,
    year: Number,
    season: String,
    regions: [ OrderSchema ]
});
SeasonSchema.plugin(timestamp);

SeasonSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Season', SeasonSchema);
