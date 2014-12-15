var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({
    // since keys in this object represent units, a rigid schema does not make sense here
}, { strict: false });

var PlayerSeasonSchema = new mongoose.Schema({
    game_id: mongoose.Schema.Types.ObjectId,
    player_id: mongoose.Schema.Types.ObjectId,
    power: String,
    year: Number,
    season: Number,
    moves: [ OrderSchema ]
});

var PlayerSeason = mongoose.model('PlayerSeason', PlayerSeasonSchema);

module.exports = {
  PlayerSeason: PlayerSeason
};
