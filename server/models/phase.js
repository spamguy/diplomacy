module.exports = function(bookshelf) {
    var _ = require('lodash'),
        phase,
        phases;

    phase = bookshelf.Model.extend({
        tableName: 'phases',
        hasTimestamps: true,

        game: function() {
            return this.belongsTo('Game');
        },

        provinces: function() {
            return this.hasMany('PhaseProvince');
        },

        toJSON: function(options) {
            return {
                id: this.get('id'),
                year: this.get('year'),
                season: this.get('season'),
                isActive: this.get('isActive'),
                provinces: _.keyBy(this.related('provinces').toJSON(), 'provinceKey')
            };
        }
    });

    phases = bookshelf.Collection.extend({
        model: phase
    });

    return {
        Phase: bookshelf.model('Phase', phase),
        Phases: bookshelf.collection('Phases', phases)
    };
};
