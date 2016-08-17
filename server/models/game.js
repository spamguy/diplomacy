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
            // Provide phases in the inverse order they were created to keep active one at top.
            return this.hasMany('Phase').query('orderBy', 'created_at', 'desc');
        },

        isEverybodyReady: function() {
            return this.related('players').every(function(p) {
                return p.pivot.get('is_ready');
            });
        },

        getClockFromSeason: function(phaseName) {
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
            var self = this,
                obfuscate = self.get('pressType') === 0,
                currentUserID,
                players;
            options = options || { };
            options.obfuscate = obfuscate;
            currentUserID = options.currentUserID;

            players = this.related('players').map(function(player) {
                var isPlayer = player.get('id') === currentUserID,
                    playerPower = player.pivot.get('power'),
                    scCount = 0;

                // Count supply centres.
                self.related('phases').at(0).related('provinces').each(function(p) {
                    scCount += (p.get('supplyCentre') === playerPower);
                });

                if (isPlayer)
                    options.currentPlayerPower = playerPower;

                return {
                    player_id: obfuscate && !isPlayer ? null : player.get('id'),
                    isReady: obfuscate && !isPlayer ? null : player.pivot.get('is_ready'),
                    power: playerPower,
                    scs: scCount
                };
            });

            return {
                id: self.get('id'),
                gmID: self.get('gmId'),
                name: self.get('name'),
                description: self.get('description'),
                status: self.get('status'),
                maxPlayers: self.get('maxPlayers'),
                variant: self.get('variant'),
                moveClock: self.get('moveClock'),
                retreatClock: self.get('retreatClock'),
                adjustClock: self.get('adjustClock'),
                pressType: self.get('pressType'),
                players: players,
                phases: self.related('phases').toJSON(options)
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
