module.exports = function(sequelize) {
    var models = {
        User: require('./user')(sequelize),
        Game: require('./game')(sequelize),
        GamePlayer: require('./gameplayer')(sequelize)
    };

    models.Game.belongsToMany(models.User, { through: models.GamePlayer, as: 'Players' });
    models.User.belongsToMany(models.Game, { through: models.GamePlayer });

    return models;
};
