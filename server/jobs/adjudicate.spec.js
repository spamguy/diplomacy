describe.only('Adjudicate job', function() {
    'use strict';

    var path = require('path'),
        expect = require('chai').expect,
        Mongoose = require('mongoose').Mongoose,
        Mockgoose = require('mockgoose'),
        mongoose = new Mongoose(),
        rewire = require('rewire'),
        sinon = require('sinon'),
        phonyJudge = sinon.stub(),
        job = rewire('./adjudicate'),
        seekrits = require('nconf')
            .file(path.relative(__dirname, 'server/config/local.env.json'))
            .file(path.relative(__dirname, 'server/config/local.env.sample.json'));

    Mockgoose(mongoose);

    before(function(done) {
        // Mock judge module.
        job.__set__({
            global: {
                state: {
                    NextFromJS: phonyJudge
                }
            }
        });

        mongoose.connect(seekrits.get('mongoURI'));
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
