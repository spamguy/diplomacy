module.exports = function(sequelize) {
    return {
        User: require('./user')(sequelize),
        Game: require('./game')(sequelize)
    };
};
