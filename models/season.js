var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({
    // since keys in this object represent units, a rigid schema does not make sense here
}, { strict: false });

var SeasonSchema = new mongoose.Schema({
    game_id: mongoose.Schema.Types.ObjectId,
    year: Number,
    season: Number,
    moves: [ OrderSchema ]
});

var Season = mongoose.model('Season', SeasonSchema);

module.exports = {
  Season: Season
};
