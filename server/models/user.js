module.exports = function(bookshelf) {
    var user,
        users;

    user = bookshelf.Model.extend({
        tableName: 'users',
        hasTimestamps: true,

        games: function() {
            return this.belongsToMany('Game', 'game_players').withPivot(['power']);
        },

        GMedGames: function() {
            return this.hasMany('Game', 'gm_id');
        },

        getDedication: function() {
            return ((this.get('actionCount') - this.get('failedActionCount')) / this.get('actionCount')) * 100;
        }
    });

    users = bookshelf.Collection.extend({
        model: user
    });

    return {
        User: bookshelf.model('User', user),
        Users: bookshelf.collection('Users', users)
    };
};
