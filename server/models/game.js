'use strict';

var mongoose = require('mongoose'),
    timestamp = require('mongoose-timestamp'),
    _ = require('lodash'),
    GameSchema = new mongoose.Schema({
        /**
         * The name of the game.
         * @type {String}
         */
        name: String,
        description: String,
        variant: String,
        year: Number,
        season: String,
        maxPlayers: Number,
        status: Number,
        gm_id: mongoose.Schema.Types.ObjectId,
        players: [{
            _id: false,
            player_id: mongoose.Schema.Types.ObjectId,
            power: String,
            isReady: {
                type: Boolean,
                default: false
            }
        }],

        /**
         * The minimum score needed for a player to be allowed entry.
         * This also acts as the player's contribution towards the pot.
         * @type {Integer}
         */
        minimumScoreToJoin: Number,
        password: String,
        passwordsalt: String,
        moveClock: Number,
        retreatClock: Number,
        adjustClock: Number,
        ignoreLateOrders: {
            type: Boolean,
            default: false
        },
        gracePeriod: {
            type: Number,
            default: 24
        }
    });

GameSchema.plugin(timestamp);

/**
 * Returns the appropriate clock associated with a season.
 * @param  {String} seasonName The name of the season.
 * @return {Number}            The season's clock.
 */
GameSchema.methods.getClockFromSeason = function(seasonName) {
    if (_.contains(seasonName.toLowerCase(), 'move'))
        return this.moveClock;
    else if (_.contains(seasonName.toLowerCase(), 'retreat'))
        return this.retreatClock;
    else if (_.contains(seasonName.toLowerCase(), 'adjust'))
        return this.adjustClock;
    else
        throw new Error('The season type could not be parsed from the name "' + seasonName + '".');
};

GameSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Game', GameSchema);
