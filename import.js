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
        var game = new ImportGame(t, file, index);

        return game.createNew()
        .then(game.init)
        .then(game.fileContentsToPhaseArray)
        .then(game.phaseArrayToDB);
    });
}

// INDIVIDUAL GAME IMPORT ---------------

function ImportGame(_t, _file, _index) {
    var t = _t,
        file = _file,
        index = _index,
        game = null,
        phaseArray = [ ];

    ImportGame.prototype.createNew = createNew;
    ImportGame.prototype.init = init;
    ImportGame.prototype.fileContentsToPhaseArray = fileContentsToPhaseArray;
    ImportGame.prototype.phaseArrayToDB = phaseArrayToDB;

    function createNew() {
        return new db.models.Game({
            variant: 'Standard',
            moveClock: 1,
            retreatClock: 1,
            adjustClock: 1,
            name: 'Godip Game #' + (index + 1),
            status: 2,
            maxPlayers: 7
        }).save(null, { transacting: t });
    }

    function init(_game) {
        return core.phase.initFromVariant(variant, _game, new Date(), t);
    }

    function fileContentsToPhaseArray(_game) {
        game = _game;

        var currentYear,
            currentSeason,
            stream = fs.createReadStream(file, { encoding: 'utf8' });

        return new Promise(function(resolve, reject) {
            var rl = readline.createInterface(stream, new Stream());
            rl.on('line', parseLine);
            rl.on('error', reject);
            rl.on('close', function() { resolve([game, phaseArray]); });
        });

        function parseLine(line) {
            var match,
                commands = [],
                IMPORT_PATTERNS = {
                    NEW_PHASE: new RegExp(/^PHASE (\d+) (\D+)$/),
                    UNIT_POSITION: new RegExp(/^(\D)\D+: (army|fleet|supply)(?:\/dislodged)? (.+)$/),
                    UNIT_ORDER: new RegExp(/^(\S+) (hold|move|support|convoy)(?: (\S+)(?: (?:move|support) (\S+))?)?(?: via convoy)?$/),
                    UNIT_BUILD: new RegExp(/^build (\S+) (\S+)$/),
                    UNIT_REMOVE: new RegExp(/^remove (\S+)$/),
                    UNIT_DISBAND: new RegExp(/^(\S+) disband$/)
                };

            if (match = line.match(IMPORT_PATTERNS.NEW_PHASE)) {
                currentYear = match[1];
                currentSeason = match[2];

                phaseArray.push({
                    year: currentYear,
                    season: currentSeason,
                    orders: [ ]
                });
            }
            else if (match = line.match(IMPORT_PATTERNS.UNIT_POSITION)) {
                /*
                 * Mostly immaterial, except for verification purposes.
                 * Godip will be handling unit position declarations.
                 */
            }
            else if (match = line.match(IMPORT_PATTERNS.UNIT_ORDER)) {
                commands.push(match[1].toUpperCase());
                if (match[2] !== 'hold')
                    commands.push(match[3].toUpperCase());
                if (match[4])
                    commands.push(match[4].toUpperCase());

                // Throw the action on top for now and pop it later.
                commands.push(match[2]);

                phaseArray[phaseArray.length - 1].orders.push(commands);
            }
            else if (match = line.match(IMPORT_PATTERNS.UNIT_BUILD)) {
                commands.push(match[1].toUpperCase());

                // Throw the action on top for now and pop it later.
                commands.push('build');
            }
            else if (match = line.match(IMPORT_PATTERNS.UNIT_DISBAND)) {
                commands.push(match[1].toUpperCase());

                // Throw the action on top for now and pop it later.
                commands.push('disband');
            }
            else if (match = line.match(IMPORT_PATTERNS.UNIT_REMOVE)) {
                commands.push(match[1].toUpperCase());

                // Throw the action on top for now and pop it later.
                commands.push('disband');
            }
            else if (line === 'ORDERS' || line === 'POSITIONS' || line === '') {
                // Expected but useless. Stuff it.
            }
            else {
                logger.warn('Line not processed: "%s"', line);
            }
        }
    }

    function phaseArrayToDB() {
        return Promise.all(phaseArray)
        .mapSeries(createNextPhaseFromOrders);
    }

    function createNextPhaseFromOrders(phaseObject) {
        return Promise.all(phaseObject.orders)
        .mapSeries(function(order) {
            var action = order.pop();
            return core.phase.setOrder(
                game.related('phases').at(0).get('id'),
                game.related('phases').at(0).get('season'),
                order,
                action,
                t);
        })
        .then(function() {
            return core.game.getAsync(game.get('id'), t);
        })
        .then(function(_game) {
            game = _game;
            var nextState,
                phaseJSON = game.related('phases').at(0).toJSON({ obfuscate: false });

            phaseJSON.seasonType = phaseJSON.season.split(' ')[1];
            nextState = global.state.NextFromJS(variant, phaseJSON);

            return core.phase.createFromState(variant, game, nextState, t)
            .then(function(_game) {
                game = _game;
            });
        });
    }
}
