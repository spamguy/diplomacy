var Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('phase_province', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            notNull: true,
            defaultValue: Sequelize.UUIDV4
        },
        phaseID: {
            type: Sequelize.UUID,
            field: 'phase_id',
            notNull: true
        },
        provinceKey: {
            type: Sequelize.TEXT,
            field: 'province_key',
            notNull: true
        },
        subProvinceKey: {
            type: Sequelize.TEXT,
            field: 'subprovince_key'
        },
        isFailed: {
            field: 'is_failed',
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        underscored: true,
        indexes: [{
            unique: true,
            fields: ['phaseID', 'provinceKey', 'subProvinceKey']
        }]
    });
};
