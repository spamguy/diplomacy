/* eslint-disable no-cond-assign */
'use strict';

var bogusPlayerIDs = ['169c63c3-64c6-40f9-9e9f-d321b0255ce1', 'a48a1d1d-c6ef-4e41-ad60-d7e10d5fadd3',
                    '2eec6004-b653-4c2b-a5f3-64f4a76512f3', '9587f7fb-2378-475e-82c9-e397cce53826',
                    'f084dd06-347a-43d7-8c41-f37c62d82cad', 'f4cb7f39-8f88-4f4f-a932-34eb94e4c6f4',
                    '9b74dea1-3b59-432a-8ae3-f924e2003864'],
    Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    readline = require('readline'),
    Stream = require('stream'),
    _ = require('lodash'),
    dirGlob = Promise.promisify(require('dir-glob')),
    globAsync = Promise.promisify(require('glob')),
    seekrits = require('nconf')
        .file('custom', path.join(process.cwd(), 'server/config/local.env.json'))
        .file('default', path.join(process.cwd(), 'server/config/local.env.sample.json')),
    logger = require('./server/logger'),
    db = require('./server/db'),
    core = require('./server/cores/index')(logger),
    variant = core.variant.get('Standard'),
    variantPowers = _.keys(variant.powers),
    filePatternToImport = dirGlob.sync([process.argv[2]])[0];

require(path.join(seekrits.get('judgePath'), 'diplomacy-godip'));

Promise.longStackTraces();

generatePlayers()
.then(function() {
    return globAsync(filePatternToImport, { nodir: true });
})
.then(processAllFiles)
.catch(function(err) {
    logger.error('Import failed:\n' + err.stack);
})
.finally(function() {
    process.exit();
});

// Use a set of dummy players for all imported games. Skip if they exist already.
function generatePlayers() {
    return core.user.get(bogusPlayerIDs[0])
    .then(function(user) {
        if (!user) {
            return Promise.map(bogusPlayerIDs, function(id, index) {
                return new db.models.User({
                    id: id,
                    email: 'bogus' + (index + 1) + '@bogus.com'
                }).save(null, { method: 'insert' });
            });
        }
        else {
            return Promise.resolve(0);
        }
    });
}

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
        phase = null,
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
        }).save(null, { transacting: t })
        .then(function(_game) {
            var shuffledPlayers = _.shuffle(bogusPlayerIDs);
            game = _game;
            return Promise.map(shuffledPlayers, function(id, index) {
                return game.related('players').attach({
                    user_id: id,
                    game_id: game.get('id'),
                    power: variantPowers[index],
                    created_at: new Date(),
                    updated_at: new Date()
                }, { transacting: t });
            });
        });
    }

    function init() {
        return core.phase.initFromVariant(variant, game, new Date(), t);
    }

    function fileContentsToPhaseArray(firstPhase) {
        phase = firstPhase;

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
                    UNIT_POSITION: new RegExp(/^(\D)\D+: (army|fleet|supply)(\/dislodged)? (.+)$/),
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
                    orders: [ ],
                    units: { }
                });
            }
            else if (match = line.match(IMPORT_PATTERNS.UNIT_POSITION)) {
                /*
                 * Mostly immaterial, except for verification purposes.
                 * Godip will be handling unit position declarations.
                 */
                if (match[2] === 'supply')
                    return;

                phaseArray[phaseArray.length - 1].units[match[4].toUpperCase()] = match[1].toUpperCase()[0];
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
                commands.push(match[2].toUpperCase());
                commands.push(match[1]);

                // Throw the action on top for now and pop it later.
                commands.push('build');

                phaseArray[phaseArray.length - 1].orders.push(commands);
            }
            else if (match = line.match(IMPORT_PATTERNS.UNIT_DISBAND)) {
                commands.push(match[1].toUpperCase());
                commands.push(null);

                // Throw the action on top for now and pop it later.
                commands.push('disband');

                phaseArray[phaseArray.length - 1].orders.push(commands);
            }
            else if (match = line.match(IMPORT_PATTERNS.UNIT_REMOVE)) {
                commands.push(match[1].toUpperCase());
                commands.push(null);

                // Throw the action on top for now and pop it later.
                commands.push('disband');

                phaseArray[phaseArray.length - 1].orders.push(commands);
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
        logger.info('Processing %s %s', phaseObject.season, phaseObject.year, { gameID: game.get('id') });

        return Promise.all(phaseObject.orders)
        .mapSeries(function(order) {
            var action = order.pop();
            try {
                return core.phase.setOrder(
                    phase.get('id'),
                    phase.get('season'),
                    order,
                    action,
                    t)
                .catch(function(ex) {
                    logger.warn('Could not set order for %s: %s', order[0], ex);
                    return Promise.resolve(0);
                });
            }
            catch (ex) {
                logger.warn('Could not set order for %s: %s', order[0], ex);
                return Promise.resolve(0);
            }
        })
        .then(function() {
            var season = phase.get('season');
            if (season.indexOf('Movement') > -1)
                return core.phase.setMovementPhaseDefaults(phase, t);
            else if (season.indexOf('Retreat') > -1)
                return core.phase.setRetreatPhaseDefaults(phase, t);
            else
                return core.phase.get(game.get('id'), null, t); // TODO: setAdjustmentPhaseDefaults()
        })
        .then(function(_phase) {
            logger.info('Adjudicating %s %s', _phase.get('season'), _phase.get('year'), { gameID: game.get('id') });
            var p;
            for (p in _.keyBy(_.filter(_phase.toJSON().provinces, function(p) { return p.unit || p.dislodged; }), 'p'))
                delete phaseObject.units[p];

            for (p in phaseObject.units)
                logger.warn('%s: Expected unit owned by %s, but was not found', p, phaseObject.units[p]);

            return core.phase.adjudicatePhase(variant, game, _phase, t);
        })
        .then(function(newPhase) {
            phase = newPhase;
        });
    }
}
