'use strict';

var fs = require('fs'),
    path = require('path');

function VariantCore(options) {
    this.core = options.core;
}

VariantCore.prototype.get = function(name) {
    name = name.replace(' ', '').toLowerCase();
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../variants', name, name + '.json')));
};

module.exports = VariantCore;
