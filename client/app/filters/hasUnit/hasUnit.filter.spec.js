describe('hasUnit filter', function() {
    var filter;

    beforeEach(function() {
        angular.mock.module('diplomacy');

        inject(function($filter) {
            filter = $filter('hasUnit');
        });
    });

    it('filters provinces by the presence of a unit', function() {
        expect(
            filter([
                { r: 'SPA', sc: [{ r: 'NC' }, { r: 'SC' }] }
            ]).length)
        .to.equal(0);
    });
});
