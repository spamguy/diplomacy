var path = require('path'),
    seekrits = require('nconf')
        .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
        .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json')),
    knex = require('knex')({
        debug: true,
        client: 'postgresql',
        connection: {
            host: '127.0.0.1',
            database: seekrits.get('db:name'),
            user: seekrits.get('db:user'),
            password: seekrits.get('db:password')
        }
    }),
    bookshelf = require('bookshelf')(knex);

bookshelf.plugin(['bookshelf-camelcase', 'registry']);

module.exports.bookshelf = bookshelf;
module.exports.models = require('./models').init(bookshelf);
