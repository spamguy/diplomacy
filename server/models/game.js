var mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
	name: String,
	variant_id: ObjectId
});

var Game = mongoose.model('Game', GameSchema);

module.exports = {
  Game: Game
};