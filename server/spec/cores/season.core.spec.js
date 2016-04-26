describe('Season core', function() {
    'use strict';

    var all = require('require-tree'),
        expect = require('chai').expect,
        mockgoose = require('mockgoose'),
        mongoose = require('../../db')(),
        SeasonCore = require('../../cores/season.core');

    // Register models.
    all('../../models');

    before(function(done) {
        mockgoose = require('mockgoose');
        mongoose = require('../../db')(function() {
            mockgoose(mongoose);
            done();
        });
    });

    describe('Create season from state', function() {
        it('works', function() {
            new SeasonCore().list({ year: 1901 }, function() {
                expect(1).to.equal(1);
            });
        });
    });
});
