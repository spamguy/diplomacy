'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash');

function SeasonCore(options) {
    this.core = options.core;
}

SeasonCore.prototype.list = function(options, cb) {
    options = options || { };
    var Season = mongoose.model('Season');
    var query = Season.find(_.pick({
        'game_id': options.gameID
    }, _.identity));

    query.exec(function(err, seasons) {
        if (err) {
            console.error(err);
            return cb(err);
        }

        cb(null, seasons);
    });
};

module.exports = SeasonCore;
