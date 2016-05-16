module.exports = function() {
    var path = require('path'),
        seekrits = seekrits = require('nconf')
            .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
            .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json')),
        Sequelize = require('sequelize'),
        sequelize = new Sequelize(
            seekrits.get('db:name'),
            seekrits.get('db:user'),
            seekrits.get('db:password'),
            { dialect: 'postgres' }
        );

    return sequelize;
};
