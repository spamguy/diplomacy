'use strict';

var mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
    name: String,
    description: String,
    variant: String,
    year: Number,
    season: Number,
    maxPlayers: Number,
    status: Number,
    players: [{
            _id: false,
            player_id: mongoose.Schema.Types.ObjectId,
            power: String
        }
    ],
    minimumScoreToJoin: Number,
    password: String,
    passwordsalt: String,
    moveClock: Number,
    retreatClock: Number,
    adjustClock: Number,
    isActive: Boolean,
    ignoreLateOrders: {
        type: Boolean,
        default: false
    }
});

GameSchema.virtual('playerCount')
    .get(function() {
        return this.players.length - 1; // The GM is not a player.
    });
GameSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Game', GameSchema);
