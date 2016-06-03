var Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('phase', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        season: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: 'Spring Movement'
        },
        year: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1901
        },
        deadline: Sequelize.DATE
    }, {
        underscored: true
    });
};
