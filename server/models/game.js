module.exports = function(bookshelf) {
    var game,
        games;

    game = bookshelf.Model.extend({
        tableName: 'games',
        hasTimestamps: true,

        players: function() {
            return this.belongsToMany('Game', 'game_players', 'game_id', 'user_id').withPivot(['power']);
        },

        phases: function() {
            return this.hasMany('Phase');
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
