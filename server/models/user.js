module.exports = function(bookshelf) {
    var user,
        users;

    user = bookshelf.Model.extend({
        tableName: 'users',
        hasTimestamps: true,

        games: function() {
            return this.belongsToMany('Game', 'game_players', 'user_id', 'game_id');
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
