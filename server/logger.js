var winston = require('winston'),
    logger = new (winston.Logger)({
        level: 'debug',
        colors: {
            error: 'red',
            warn: 'yellow',
            data: 'grey'
        },
        transports: [
            new (winston.transports.Console)({ colorize: true })
        ]
    });

module.exports = logger;
