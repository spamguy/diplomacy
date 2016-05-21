var Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('game', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        name: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        description: Sequelize.TEXT
    }, {
        underscored: true
    });
};
