'use strict';

var UserCore = require('./user.core'),
    GameCore = require('./game.core'),
    PhaseCore = require('./phase.core'),
    VariantCore = require('./variant.core'),
    core = { };

module.exports = function(logger) {
    core.user = new UserCore(core, logger);
    core.game = new GameCore(core, logger);
    core.phase = new PhaseCore(core, logger);
    core.variant = new VariantCore(core, logger);

    return core;
};
