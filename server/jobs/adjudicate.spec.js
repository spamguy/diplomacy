describe.only('Adjudicate job', function() {
    'use strict';

    var expect = require('chai').expect,
        Mongoose = require('mongoose').Mongoose,
        Mockgoose = require('mockgoose'),
        mongoose = new Mongoose(),
        seekrits,
        job = require('./adjudicate');
    try {
        seekrits = require('../config/local.env');
    }
    catch (ex) {
        if (ex.code === 'MODULE_NOT_FOUND')
            seekrits = require('../config/local.env.sample');
    };

    Mockgoose(mongoose);

    before(function(done) {
        mongoose.connect(seekrits.mongoURI);
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
