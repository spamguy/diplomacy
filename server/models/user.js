var Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('user', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        }, {
            instanceMethods: {
                
            }
        }
    });
};
