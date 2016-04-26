module.exports = function(cb) {
    var path = require('path'),
        seekrits = require('nconf')
            .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
            .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json')),
        Mongoose = require('mongoose');

    cb = cb || function() { };
    Mongoose.createConnection(seekrits.get('mongoURI'), cb);
    Mongoose.set('debug', true);

    return Mongoose;
};
