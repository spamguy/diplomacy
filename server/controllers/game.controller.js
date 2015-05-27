'use strict';

var seekrits;
try {
    seekrits = require('../config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
        seekrits = require('../config/local.env.sample');
}

module.exports = function() {
    var app = this.app,
        core = this.core;

    app.get('/api/users/:id/games', function(req) {

    });
};
