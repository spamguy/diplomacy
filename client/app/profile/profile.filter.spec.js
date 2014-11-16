describe('Profile games filter', function () {
    'use strict';

    var filter;

    beforeEach(function() {
        module('profile');

        inject(function($filter) {
            filter = $filter('gmStatus');
        });
    });

    it('has a filter for admin status', function() {
        expect(filter).not.toBeNull();
    });

    it('filters out admin games when flag is false', function() {
        expect(
            filter([
                { isAdmin: true }, { isAdmin: true }, { isAdmin: false }
            ], false).length)
        .toEqual(1);
    });

    it('filters out non-admin games when flag is true', function() {
        expect(
            filter([
                { isAdmin: true }, { isAdmin: false }, { isAdmin: false }
            ], true).length)
        .toEqual(1);
    });
});
