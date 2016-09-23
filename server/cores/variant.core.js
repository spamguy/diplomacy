'use strict';

var fs = require('fs'),
    path = require('path');

function VariantCore() {
}

VariantCore.prototype.get = function(name) {
    name = name.replace(new RegExp(' ', 'g'), '').toLowerCase();
    var result = JSON.parse(fs.readFileSync(path.join(__dirname, '../../variants', name, name + '.json')));

    // Merge in default properties like phase names.
    result.phases = result.phases || ['Spring Movement', 'Summer Retreat', 'Fall Movement', 'Fall Retreat', 'Winter Adjustment'];

    return result;
};

module.exports = VariantCore;
