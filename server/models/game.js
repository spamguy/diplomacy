var GameSchema;
module.exports = function(id) {
    'use strict';

    var mongoose = require('mongoose');

    if (!GameSchema) {
        GameSchema = new mongoose.Schema({
            name: String,
            variant: String,
            year: Number,
            season: Number,
            players: [{
                    player_id: mongoose.Schema.Types.ObjectId,
                    power: String
                }
            ],
            minimumScoreToJoin: Number,
            password: String,
            passwordsalt: String
        });
        GameSchema.virtual('isAdmin')
            .get(function() {
                for (var p = 0; p < this.players.length; p++) {
                    if (this.players[p].power === '*' && this.players[p].player_id.toString() === id.toString())
                        return true;
                }

                // no admin found with id pairing
                return false;
            });
        GameSchema.set('toJSON', { virtuals: true });
    }

    var Game = mongoose.model('Game', GameSchema);

    return {
      Game: Game
    };
};
