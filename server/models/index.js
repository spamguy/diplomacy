module.exports = function(sequelize) {
    return {
        User: require('./user')(sequelize)
    };
};
