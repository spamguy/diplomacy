module.exports = function(sequelize) {
    var models = {
        User: require('./user')(sequelize),
        Game: require('./game')(sequelize),
        GamePlayer: require('./gameplayer')(sequelize),
        Phase: require('./phase')(sequelize),
        PhaseProvince: require('./phaseprovince')(sequelize)
    };

    models.Game.belongsToMany(models.User, { through: models.GamePlayer, as: 'players' });
    models.User.belongsToMany(models.Game, { through: models.GamePlayer, foreignKey: 'user_id' });

    models.Game.belongsTo(models.User, { foreignKey: 'gm_id', as: 'GM' });

    models.Phase.belongsTo(models.Game);
    models.Game.hasMany(models.Phase);

    models.PhaseProvince.belongsTo(models.Phase, { foreignKey: 'phase_id' });
    models.Phase.hasMany(models.PhaseProvince, { as: 'provinces' });

    return models;
};
