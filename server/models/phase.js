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
            options = options || { obfuscate: false };
            return {
                id: this.get('id'),
                year: this.get('year'),
                season: this.get('season'),
                isActive: this.get('isActive'),
                deadline: this.get('deadline'),
                seasonIndex: this.get('seasonIndex'),
                provinces: _.keyBy(this.related('provinces').toJSON(options), 'p')
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
