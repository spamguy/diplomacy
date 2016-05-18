'use strict';

var UserCore = require('./user.core');/*,
    GameCore = require('./game.core'),
    SeasonCore = require('./season.core'),
    VariantCore = require('./variant.core'),
    EventEmitter = require('events').EventEmitter;*/

function Core() {
    //EventEmitter.call(this);

    this.user = new UserCore({
        core: this
    });

    /*this.game = new GameCore({
        core: this
    });

    this.season = new SeasonCore({
        core: this
    });

    this.variant = new VariantCore({
        core: this
    });*/
}

module.exports = new Core();
