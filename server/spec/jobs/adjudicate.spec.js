describe('Adjudicate job', function() {
    'use strict';

    var expect = require('chai').expect,
        mockgoose = require('mockgoose'),
        mongoose = require('../../db')(),
        rewire = require('rewire'),
        sinon = require('sinon'),
        phonyJudge = sinon.stub(),
        job = rewire('../../jobs/adjudicate');

    mockgoose(mongoose);

    before(function(done) {
        // Mock judge module.
        job.__set__({
            global: {
                state: {
                    NextFromJS: phonyJudge
                }
            }
        });

        done();
    });

    // beforeEach(function(done) {
    //     done();
    // });
    //
    // afterEach(function() {
    //     Mockgoose.reset();
    // });

    it('works', function() {
        expect(1).to.equal(1);
    });
});
