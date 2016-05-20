var Sequelize = require('sequelize'),
    User = require('./user');

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
        description: Sequelize.TEXT,
        gmID: {
            type: Sequelize.UUID,
            references: {
                model: User,
                key: 'id'
            }
        }
    }, {
        underscored: true
    });
};
