var Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('game_player', {
        isReady: {
            defaultValue: false,
            type: Sequelize.BOOLEAN,
            field: 'is_ready'
        },
        isDisabled: {
            defaultValue: false,
            type: Sequelize.BOOLEAN,
            field: 'is_disabled'
        },
        powerPreferences: {
            type: Sequelize.TEXT,
            field: 'power_preferences'
        },
        power: Sequelize.STRING(2)
    }, {
        underscored: true
    });
};
