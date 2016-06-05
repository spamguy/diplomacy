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
        supplyCentre: {
            type: Sequelize.STRING(2),
            field: 'supply_centre'
        },
        supplyCentreX: {
            type: Sequelize.INTEGER,
            field: 'supply_centre_x'
        },
        supplyCentreY: {
            type: Sequelize.INTEGER,
            field: 'supply_centre_y'
        },
        unitOwner: {
            type: Sequelize.STRING(2),
            field: 'unit_owner'
        },
        unitType: {
            type: Sequelize.INTEGER,
            field: 'unit_type'
        },
        unitX: {
            type: Sequelize.INTEGER,
            field: 'unit_x'
        },
        unitY: {
            type: Sequelize.INTEGER,
            field: 'unit_y'
        },
        unitAction: {
            type: Sequelize.ENUM('hold', 'move', 'support', 'convoy', 'build', 'disband'),
            field: 'unit_action'
        },
        unitTarget: {
            type: Sequelize.STRING,
            field: 'unit_target'
        },
        unitSubTarget: {
            type: Sequelize.STRING,
            field: 'unit_subtarget'
        },
        unitTargetOfTarget: {
            type: Sequelize.STRING,
            field: 'unit_target_of_target'
        },
        unitSubTargetOfTarget: {
            type: Sequelize.STRING,
            field: 'unit_subtarget_of_target'
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
