var _ = require('lodash'),
    Sequelize = require('sequelize');

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
        variant: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: 'Standard'
        },
        status: {
            type: Sequelize.INTEGER,
            min: 0,
            allowNull: false
        },
        moveClock: {
            type: Sequelize.DECIMAL(6, 2),
            defaultValue: 24.0,
            allowNull: false,
            field: 'move_clock'
        },
        retreatClock: {
            type: Sequelize.DECIMAL(6, 2),
            defaultValue: 24.0,
            allowNull: false,
            field: 'retreat_clock'
        },
        adjustClock: {
            type: Sequelize.DECIMAL(6, 2),
            defaultValue: 24.0,
            allowNull: false,
            field: 'adjust_clock'
        },
        maxPlayers: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'max_players'
        }
    }, {
        underscored: true,
        instanceMethods: {
            getClockFromPhase: function(phaseName) {
                if (_.includes(phaseName.toLowerCase(), 'move'))
                    return this.moveClock;
                else if (_.includes(phaseName.toLowerCase(), 'retreat'))
                    return this.retreatClock;
                else if (_.includes(phaseName.toLowerCase(), 'adjust'))
                    return this.adjustClock;
                else
                    throw new Error('The phase type could not be parsed from the name "' + phaseName + '".');
            },

            currentPhase: function() {
                return this.phases[0];
            },

            // Filter out identifying information in gunboat games.
            toJSON: function(isAnonymous, userID) {
                var out = this.get({ plain: true }),
                    p;

                for (p = 0; p < out.players.length; p++) {
                    if (isAnonymous && userID !== out.players[p].id) {
                        delete out.players[p].id;
                        delete out.players[p].email;
                    }
                }

                return out;
            }
        }
    });
};
