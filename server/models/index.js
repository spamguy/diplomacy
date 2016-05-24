module.exports = function(sequelize) {
    var models = {
        User: require('./user')(sequelize),
        Game: require('./game')(sequelize),
        GamePlayer: require('./gameplayer')(sequelize)
    };

    models.Game.belongsToMany(models.User, { through: models.GamePlayer, as: 'Players' });
    models.User.belongsToMany(models.Game, { through: models.GamePlayer });

    models.Game.belongsTo(models.User, { foreignKey: 'gm_id', as: 'GM' });
    // models.User.hasMany(models.Game, { as: 'OwnedGames' });

    return models;
};
