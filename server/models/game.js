module.exports = function(bookshelf) {
    var game,
        games;

    game = bookshelf.Model.extend({
        tableName: 'games',
        hasTimestamps: true,

        players: function() {
            return this.belongsToMany('User', 'game_players', 'game_id', 'user_id').withPivot(['power']);
        },

        GM: function() {
            return this.hasOne('User', 'gm_id');
        },

        phases: function() {
            return this.hasMany('Phase');
        },

        toJSON: function(options) {
            var obfuscate = this.get('pressType') === 0;
            options = options || { };

            return {
                id: this.get('id'),
                name: this.get('name'),
                description: this.get('description'),
                status: this.get('status'),
                maxPlayers: this.get('maxPlayers'),
                variant: this.get('variant'),
                moveClock: this.get('moveClock'),
                retreatClock: this.get('retreatClock'),
                adjustClock: this.get('adjustClock'),
                pressType: this.get('pressType'),
                players: this.related('players').map(function(player) {
                    return {
                        id: obfuscate ? null : player.get('id'),
                        power: player.pivot.get('power')
                    };
                }),
                phases: this.related('phases').toJSON()
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
