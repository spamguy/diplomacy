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

module.exports = mongoose.model('Season', SeasonSchema);
