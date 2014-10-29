var mongoose = require('mongoose');

var GameSeasonSchema = new mongoose.Schema({
	game_id: mongoose.Schema.Types.ObjectId,
	season: {
		type: String,
		enum: 'Spring Summer Fall Winter'.split(' ')
	},
	year: Number,
	moves: [{

		}
	]
});

var GameSeason = mongoose.model('GameSeason', GameSeasonSchema);

module.exports = {
  GameSeason: GameSeason
};