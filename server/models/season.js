var mongoose = require('mongoose'),
    timestamp = require('mongoose-timestamp'),
    OrderSchema = new mongoose.Schema({ }, { strict: false, _id: false }),
    SeasonSchema = new mongoose.Schema({
        game_id: mongoose.Schema.Types.ObjectId,
        year: Number,
        season: String,
        deadline: Date,
        regions: [ OrderSchema ]
    });
SeasonSchema.plugin(timestamp);

module.exports = mongoose.model('Season', SeasonSchema);
