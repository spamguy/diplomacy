var GameSchema;
module.exports = function(id) {
    'use strict';

    var mongoose = require('mongoose');

    if (!GameSchema) {
        GameSchema = new mongoose.Schema({
            name: String,
            description: String,
            variant: String,
            year: Number,
            season: Number,
            maxPlayers: Number,
            players: [{
                    player_id: mongoose.Schema.Types.ObjectId,
                    power: String
                }
            ],
            minimumScoreToJoin: Number,
            password: String,
            passwordsalt: String,
            movementClock: Number
        });
        GameSchema.virtual('isAdmin')
            .get(function() {
                for (var p = 0; p < this.players.length; p++) {
                    if (id && this.players[p].power === '*' && this.players[p].player_id.toString() === id.toString())
                        return true;
                }

                // no admin found with id pairing
                return false;
            });
        GameSchema.virtual('playerCount')
            .get(function() {
                return this.players.length - 1; // the GM is not a player
            });
        GameSchema.set('toJSON', { virtuals: true });
    }

    var Game = mongoose.model('Game', GameSchema);

    return {
      Game: Game
    };
};
