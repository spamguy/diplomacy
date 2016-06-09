module.exports = function(bookshelf) {
    var phase,
        phases;

    phase = bookshelf.Model.extend({
        tableName: 'phases',
        hasTimestamps: true,

        game: function() {
            return this.belongsTo('Game');
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
