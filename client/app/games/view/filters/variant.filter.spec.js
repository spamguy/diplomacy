describe('Game list variant filter', function() {
    'use strict';

    var filter;

    beforeEach(function() {
        module('games');

        inject(function($filter) {
            filter = $filter('variant');
        });
    });

    it('matches against variant names', function() {
        expect(
            filter([
                { variant: 'Standard' }, { variant: 'Standard' }, { variant: 'Chromatic' }
            ], 'Standard').length)
        .toEqual(2);
    });

    it('is case-insensitive', function() {
        expect(
            filter([
                { variant: 'Standard' }, { variant: 'standard' }, { variant: 'stANDard' }
            ], 'STANdard').length)
        .toEqual(3);
    });
});
