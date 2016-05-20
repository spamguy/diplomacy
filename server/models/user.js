var Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('user', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        email: {
            type: Sequelize.TEXT,
            unique: true
        },
        tempEmail: {
            type: Sequelize.TEXT,
            field: 'temp_email'
        },
        password: Sequelize.TEXT,
        passwordSalt: {
            type: Sequelize.TEXT,
            field: 'password_salt'
        },
        actionCount: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            field: 'action_count'
        },
        failedActionCount: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            field: 'failed_action_count'
        }
    }, {
        underscored: true,
        instanceMethods: {
        }
    });
};
