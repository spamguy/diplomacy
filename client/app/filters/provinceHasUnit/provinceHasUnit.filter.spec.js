describe('provinceHasUnit filter', function() {
    var filter;

    beforeEach(function() {
        angular.mock.module('diplomacy');

        inject(function($filter) {
            filter = $filter('provinceHasUnit');
        });
    });

    it('filters provinces by the presence of a unit', function() {
        expect(filter([ { r: 'SPA' } ]).length).to.equal(0);
    });
});
