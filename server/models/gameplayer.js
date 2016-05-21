var Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('game_player', {
        gameID: {
            type: Sequelize.UUID,
            field: 'game_id'
        },
        userID: {
            type: Sequelize.UUID,
            field: 'user_id'
        },
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
        power: Sequelize.STRING(2)
    }, {
        underscored: true
    });
};
