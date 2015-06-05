'use strict';

var mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
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
    movementClock: Number,
    isActive: Boolean
});

GameSchema.virtual('playerCount')
    .get(function() {
        return this.players.length - 1; // the GM is not a player
    });
GameSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Game', GameSchema);
