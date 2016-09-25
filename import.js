/* eslint-disable no-cond-assign */
'use strict';

var Promise = require('bluebird'),
    fs = require('fs'),
    readline = require('readline'),
    Stream = require('stream'),
    dirGlob = Promise.promisify(require('dir-glob')),
    globAsync = Promise.promisify(require('glob')),
    logger = require('./server/logger'),
    db = require('./server/db'),
    core = require('./server/cores/index'),
    variant = core.variant.get('Standard'),
    filePatternToImport = dirGlob.sync([process.argv[2]])[0];

Promise.longStackTraces();

globAsync(filePatternToImport, { nodir: true })
    .then(processAllFiles)
    .catch(function(err) {
        logger.error('Import failed:\n' + err.stack);
    })
    .finally(function() {
        process.exit();
    });

function processAllFiles(files) {
    logger.info('Importing %d game files into dipl.io', files.length);

    return Promise.each(files, createGameFromFile, { concurrency: 2 });
}

function createGameFromFile(file, index) {
    return db.bookshelf.transaction(function(t) {
        return createNewGame(t, file, index)
        .spread(initGame)
        .spread(processFileContents);
    });
}

function createNewGame(t, file, index) {
    return Promise.all([t, file, new db.models.Game({
        variant: 'Standard',
        moveClock: 1,
        retreatClock: 1,
        adjustClock: 1,
        name: 'Godip Game #' + (index + 1),
        status: 2,
        maxPlayers: 7
    }).save(null, { transacting: t })]);
}

function initGame(t, file, game) {
    return Promise.all([t, file, core.phase.initFromVariant(t, variant, game, new Date())]);
}

function processFileContents(t, file, game) {
    return new Promise(function(resolve, reject) {
        var stream = fs.createReadStream(file, { encoding: 'utf8' }),
            rl = readline.createInterface(stream, new Stream());

        rl.on('line', parseLine);
        rl.on('error', reject);
        rl.on('close', resolve);
    });
}

function parseLine(line) {
    var match,
        IMPORT_PATTERNS = {
            NEW_PHASE: new RegExp(/^PHASE (\d+) (\D+)$/),
            UNIT_POSITION: new RegExp(/^(\D)\D+: (\barmy|fleet|supply) (.+)$/)
        };

    if (match = line.match(IMPORT_PATTERNS.NEW_PHASE)) {
        logger.debug('New phase: ' + line);
    }
    else if (match = line.match(IMPORT_PATTERNS.UNIT_POSITION)) {
    }
}

//     stream.on('data', function(line) {
//         var match,
//             splitProvince;
//
//         if (match = line.match(IMPORT_PATTERNS.NEW_PHASE)) {
//             logger.debug('New phase: ' + line);
//
//             stream.pause();
//
//             new db.models.Phase({
//                 gameID: game.get('id'),
//                 year: match[1],
//                 season: match[2],
//                 seasonIndex: variant.phases.indexOf(match[2]) + 1
//             }).save(null, { transacting: t }).then(function(phase) {
//                 phaseID = phase.get('id');
//                 core.phase.generatePhaseProvincesFromTemplate(t, variant, phase, function(err) {
//                     if (err)
//                         cb(err);
//                     stream.resume();
//                 });
//             });
//         }
//         else if (match = line.match(IMPORT_PATTERNS.UNIT_POSITION)) {
//             splitProvince = match[3].toUpperCase().split('/');
//         }
//     });
//
//     stream.on('error', function(err) {
//         cb(err);
//         return;
//     });
// }
//
// function mapUnitTypeToCode(type) {
//     switch (type) {
//     case 'ARMY': return 1;
//     case 'FLEET': return 2;
//     default: return null;
//     }
// }
