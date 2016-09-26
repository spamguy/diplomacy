/* eslint-disable no-cond-assign */
'use strict';

var Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    readline = require('readline'),
    Stream = require('stream'),
    dirGlob = Promise.promisify(require('dir-glob')),
    globAsync = Promise.promisify(require('glob')),
    seekrits = require('nconf')
        .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
        .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json')),
    logger = require('./server/logger'),
    db = require('./server/db'),
    core = require('./server/cores/index'),
    variant = core.variant.get('Standard'),
    filePatternToImport = dirGlob.sync([process.argv[2]])[0];

require(path.join(seekrits.get('judgePath'), 'diplomacy-godip'));

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
    var currentPhase = game.related('phases').at(0);

    return new Promise(function(resolve, reject) {
        var stream = fs.createReadStream(file, { encoding: 'utf8' }),
            rl = readline.createInterface(stream, new Stream());

        rl.on('line', parseLine);
        rl.on('error', reject);
        rl.on('close', resolve);
    });

    function parseLine(line) {
        var match,
            commands = [],
            IMPORT_PATTERNS = {
                NEW_PHASE: new RegExp(/^PHASE (\d+) (\D+)$/),
                UNIT_POSITION: new RegExp(/^(\D)\D+: (\barmy|fleet|supply) (.+)$/),
                UNIT_ORDER: new RegExp(/^(\w+) (\bhold|move|support|convoy\b) (\w+)(?: \bmove|convoy\b (\w+))?$/)
            };

        if (match = line.match(IMPORT_PATTERNS.NEW_PHASE)) {
            logger.debug('New phase: ' + line);

            // First phase was created already.
            if (match[1] === '1901' && match[2] === 'Spring Movement')
                return;
        }
        else if (match = line.match(IMPORT_PATTERNS.UNIT_POSITION)) {
            /*
             * Mostly immaterial, except for verification purposes.
             * Godip will be handling unit position declarations.
             */
        }
        else if (match = line.match(IMPORT_PATTERNS.UNIT_ORDER)) {
            commands.push(match[1].toUpperCase());
            commands.push(match[3].toUpperCase());
            if (match[4])
                commands.push(match[4].toUpperCase());

            core.phase.setOrder(currentPhase.get('id'), commands, match[2], t)
            .then(function(result) {
            });
        }
    }
}
