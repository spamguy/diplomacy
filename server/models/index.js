module.exports = function(sequelize) {
    var models = {
        User: require('./user')(sequelize),
        Game: require('./game')(sequelize),
        GamePlayer: require('./gameplayer')(sequelize),
        Season: require('./season')(sequelize),
        SeasonProvince: require('./seasonprovince')(sequelize)
    };

    models.Game.belongsToMany(models.User, { through: models.GamePlayer, as: 'players' });
    models.User.belongsToMany(models.Game, { through: models.GamePlayer, foreignKey: 'user_id' });

    models.Game.belongsTo(models.User, { foreignKey: 'gm_id', as: 'GM' });

    models.Season.belongsTo(models.Game);
    models.Game.hasMany(models.Season);

    models.SeasonProvince.belongsTo(models.Season, { foreignKey: 'season_id' });
    models.Season.hasMany(models.SeasonProvince, { as: 'provinces' });

    return models;
};
