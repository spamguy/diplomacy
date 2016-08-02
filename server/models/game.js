module.exports = function(bookshelf) {
    var _ = require('lodash'),
        game,
        games;

    game = bookshelf.Model.extend({
        tableName: 'games',
        hasTimestamps: true,

        players: function() {
            return this.belongsToMany('User', 'game_players', 'game_id', 'user_id').withPivot(['power', 'is_ready']);
        },

        GM: function() {
            return this.hasOne('User', 'gm_id');
        },

        phases: function() {
            return this.hasMany('Phase');
        },

        isEverybodyReady: function() {
            return this.related('players').every(function(p) {
                return p.pivot.get('is_ready');
            });
        },

        getClockFromPhase: function(phaseName) {
            if (_.includes(phaseName.toLowerCase(), 'move'))
                return this.get('moveClock');
            else if (_.includes(phaseName.toLowerCase(), 'retreat'))
                return this.get('retreatClock');
            else if (_.includes(phaseName.toLowerCase(), 'adjust'))
                return this.get('adjustClock');
            else
                throw new Error('The phase type could not be parsed from the name "' + phaseName + '".');
        },

        toJSON: function(options) {
            // FIXME: Resolved state and user role also affect whether to obfuscate.
            var obfuscate = this.get('pressType') === 0,
                currentUserID,
                players;
            options = options || { };
            options.obfuscate = obfuscate;
            currentUserID = options.currentUserID;

            players = this.related('players').map(function(player) {
                var isPlayer = player.get('id') === currentUserID;
                if (isPlayer)
                    options.currentPlayerPower = player.pivot.get('power');

                return {
                    player_id: obfuscate && !isPlayer ? null : player.get('id'),
                    isReady: obfuscate && !isPlayer ? null : player.pivot.get('is_ready'),
                    power: player.pivot.get('power')
                };
            });

            return {
                id: this.get('id'),
                gmID: this.get('gmId'),
                name: this.get('name'),
                description: this.get('description'),
                status: this.get('status'),
                maxPlayers: this.get('maxPlayers'),
                variant: this.get('variant'),
                moveClock: this.get('moveClock'),
                retreatClock: this.get('retreatClock'),
                adjustClock: this.get('adjustClock'),
                pressType: this.get('pressType'),
                players: players,
                phases: this.related('phases').toJSON(options)
            };
        }
    });

    games = bookshelf.Collection.extend({
        model: game
    });

    return {
        Game: bookshelf.model('Game', game),
        Games: bookshelf.collection('Games', games)
    };
};
