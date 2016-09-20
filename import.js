'use strict';

var path = require('path'),
    fs = require('fs'),
    byline = require('byline'),
    async = require('async'),
    dirGlob = require('dir-glob'),
    glob = require('glob'),
    logger = require('./server/logger'),
    db = require('./server/db'),
    filePatternToImport = dirGlob.sync([process.argv[2]])[0];

async.waterfall([
    function(cb) {
        glob(filePatternToImport, { nodir: true }, cb);
    },

    function(files, cb) {
        logger.info('Importing %d game files into dipl.io', files.length);

        async.forEachOfLimit(files, 5, importFile, cb);
    }
], function(err) {
    if (err)
        logger.error('Import failed:\n' + err);
    process.exit();
});

function importFile(file, index, cb) {
    var stream = byline(fs.createReadStream(file, { encoding: 'utf8' }));

    async.waterfall([
        function(cb2) {
            // STEP 1: Create game from file.
            new db.models.Game({
                variant: 'Standard',
                moveClock: 1,
                retreatClock: 1,
                adjustClock: 1,
                name: 'Godip Game #' + (index + 1)
            }).save().asCallback(cb2);
        }
    ], cb);

    stream.on('data', function(line) {
    });
}
