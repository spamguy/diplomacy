'use strict';

var fs = require('fs'),
    path = require('path');

function VariantCore(options) {
    this.core = options.core;
}

VariantCore.prototype.get = function(name) {
    name = name.replace(' ', '').toLowerCase();
    var result = JSON.parse(fs.readFileSync(path.join(__dirname, '../../variants', name, name + '.json')));

    // Merge in default properties like season names.
    result.seasons = result.seasons || ['Spring Movement', 'Summer Retreat', 'Fall Movement', 'Fall Retreat', 'Winter Adjustment'];

    return result;
};

module.exports = VariantCore;
