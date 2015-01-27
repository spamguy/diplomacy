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
            ]
        });
        GameSchema.virtual('isAdmin')
            .get(function() {
                for (var p = 0; p < this.length; p++) {
                    if (p.power === '*' && p._id === id)
                        return true;
                }

                // no admin found with id pairing
                return false;
            });
        GameSchema.set('toJSON', { virtuals: true });
    }

    var Game = mongoose.model('Game', GameSchema);

    // helper functions
    Game.test = function() { console.log('hello there!'); };

    return {
      Game: Game
    };
};
