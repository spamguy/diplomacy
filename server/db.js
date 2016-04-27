module.exports = function() {
    var path = require('path'),
        seekrits = require('nconf')
            .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
            .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json')),
        Mongoose = require('mongoose');

    Mongoose.connect(seekrits.get('mongoURI'));
    Mongoose.set('debug', true);

    return Mongoose;
};
