var mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
	name: String,
	variant_id: mongoose.Schema.Types.ObjectId
});

var Game = mongoose.model('Game', GameSchema);

module.exports = {
  Game: Game
};