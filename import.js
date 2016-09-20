/* eslint-disable no-cond-assign */
'use strict';

var fs = require('fs'),
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

        async.forEachOfLimit(files, 5, createGameFromFile, cb);
    }
], function(err) {
    if (err)
        logger.error('Import failed:\n' + err);
    process.exit();
});

function createGameFromFile(file, index, cb) {
    db.bookshelf.transaction(function(t) {
        async.waterfall([
            // STEP 1: Create game from file.
            function(cb2) {
                new db.models.Game({
                    variant: 'Standard',
                    moveClock: 1,
                    retreatClock: 1,
                    adjustClock: 1,
                    name: 'Godip Game #' + (index + 1),
                    status: 2,
                    maxPlayers: 7
                }).save(null, { transacting: t }).asCallback(cb2);
            },

            function(game, cb2) {
                processFileContents(file, game, t, cb2);
            }
        ], function(err, result) {
            if (!err) {
                t.commit();
                cb(null);
            }
            else {
                t.rollback();
                cb(err);
            }
        });
    });
}

function processFileContents(file, game, t, cb) {
    var phase,
        stream = byline(fs.createReadStream(file, { encoding: 'utf8' })),
        IMPORT_PATTERNS = {
            NEW_PHASE: new RegExp(/^PHASE (\d+) (\D+)$/)
        };

    stream.on('data', function(line) {
        var match;
        if (line === '') {
            // Do nothing.
        }
        else if (match = line.match(IMPORT_PATTERNS.NEW_PHASE)) {
            logger.debug('New phase: ' + line);

            stream.pause();

            new db.models.Phase({
                gameID: game.get('id')
            }).save(null, { transacting: t }).asCallback(function(err, _phase) {
                if (err) {
                    cb(err);
                    return;
                }

                phase = _phase;

                stream.resume();
            });
        }
        else if (match = line.match(IMPORT_PATTERNS.MOVE)) {
            new db.models.PhaseProvince({
                phaseID: phase.get('id')
            }).save(null, { transacting: t });
        }
    });

    stream.on('end', function() {
        cb(null);
    });

    stream.on('error', function(err) {
        cb(err);
        return;
    });
}
