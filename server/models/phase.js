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
        underscored: true,
        instanceMethods: {
            toJSON: function(isAdmin) {
                var out = this.get({ plain: true }),
                    provinces = { },
                    p;

                for (p = 0; p < out.provinces.length; p++) {
                    provinces[out.provinces[p].provinceKey] = {
                        isFailed: out.provinces[p].isFailed,
                        isAdmin: isAdmin
                    };
                }

                out.provinces = provinces;

                return out;
            }
        }
    });
};
