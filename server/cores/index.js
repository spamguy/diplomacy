'use strict';

var UserCore = require('./user.core'),
    GameCore = require('./game.core'),
    EventEmitter = require('events').EventEmitter;

function Core() {
    EventEmitter.call(this);

    this.user = new UserCore({
        core: this
    });

    this.game = new GameCore({
        core: this
    });
}

module.exports = new Core();
