describe('provinceHasSC filter', function() {
    var filter;

    beforeEach(function() {
        angular.mock.module('diplomacy');

        inject(function($filter) {
            filter = $filter('provinceHasSC');
        });
    });

    it('filters provinces by the presence of a supply centre', function() {
        expect(filter([ { p: 'SPA' } ]).length).to.equal(0);
    });
});
