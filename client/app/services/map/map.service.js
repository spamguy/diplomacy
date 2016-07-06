angular.module('mapService', ['gameService'])
.service('mapService', ['$location', 'gameService', function($location, gameService) {
    'use strict';

    var currentAction = 'hold',
        commandData = [],
        service = function(game, phaseIndex) {
            this.game = game;
            this.phaseIndex = phaseIndex;
            this.phase = game.phases ? game.phases[phaseIndex] : null;
        };

    service.prototype.getSCTransform = getSCTransform;
    service.prototype.getSCPath = getSCPath;
    service.prototype.provinceHasSC = provinceHasSC;
    service.prototype.generateMarkerEnd = generateMarkerEnd;
    service.prototype.setCurrentAction = setCurrentAction;
    service.prototype.inputCommand = inputCommand;
    service.prototype.userCanMove = userCanMove;
    service.prototype.userCanAdjust = userCanAdjust;
    service.prototype.userCanRetreat = userCanRetreat;
    service.prototype.isActionCurrent = isActionCurrent;
    service.prototype.provinceHasUnit = provinceHasUnit;

    return service;

    // PRIVATE FUNCTIONS

    function getSCTransform(p) {
        return 'translate' + this.phase.provinces[p].sc.location + ' scale(0.04)';
    }

    function generateMarkerEnd(d) {
        // See CSS file for why separate markers exist for failed orders.
        var failed = d.target.failed ? 'failed' : '';
        return 'url(' + $location.absUrl() + '#' + failed + d.target.action + ')';
    }

    function setCurrentAction(action) {
        currentAction = action;

        // Reset any half-made orders.
        clearAllCommands();
    }

    function clearAllCommands() {
        while (commandData.length) commandData.pop();
    }

    function inputCommand(id, callback) {
        var p = id.toUpperCase().replace('-', '/'), // HTML IDs use - for subdivisions.
            province = this.phase.provinces[p],
            overrideAction;

        // TODO: Force armies to move to provinces only.

        // Users who try to control units that don't exist or don't own?
        // We have ways of shutting the whole thing down.
        if (commandData.length === 0 &&
            (!province.unit || province.unit.owner !== gameService.getPowerOfCurrentUserInGame(this.game)))
            return;

        commandData.push(p);

        switch (currentAction) {
        case 'hold':
            // Don't bother retaining clicks. Just continue on to send the command.
            break;
        case 'move':
            // Source, target.
            if (commandData.length < 2)
                return;

            // Don't move to yourself. Treat this as a hold.
            if (commandData[0] === commandData[1]) {
                commandData.pop();
                overrideAction = 'hold';
            }
            break;
        case 'support':
            // Don't support yourself. Treat this as a hold.
            if (commandData[0] === commandData[1]) {
                clearAllCommands();
                overrideAction = 'hold';
            }
            // Source, target, target of target.
            else if (commandData.length < 3) {
                return;
            }
            // Source, holding target.
            else if (commandData[1] === commandData[2]) {
                commandData.pop();
            }
            break;
        case 'convoy':
            /*
             * Don't convoy the convoyer.
             * Don't convoy into the convoyer.
             * Don't let the start equal the finish.
             * In short, source, target, target of target should be distinct.
             * Treat violations of the above as a hold.
             */
            if (commandData.length !== _.uniq(commandData).length) {
                clearAllCommands();
                overrideAction = 'hold';
            }
            break;
        }

        // Making it this far means there is a full set of commands to publish.
        gameService.publishCommand(currentAction, commandData, this.phase,
            function(response) {
                callback(response, commandData[0], overrideAction || currentAction, commandData[1], commandData[2]);
                clearAllCommands();
            }
        );
    }

    function userCanMove() {
        return _.contains(this.phase.season, 'move');
    }

    function userCanRetreat() {
        return _.contains(this.phase.season, 'retreat');
    }

    function userCanAdjust() {
        return _.contains(this.phase.season, 'adjust');
    }

    function getSCPath() {
        return $location.absUrl() + '#sc';
    }

    function isActionCurrent(action) {
        return action === currentAction;
    }

    function provinceHasSC(input) {
        return input.sc !== null;
    }

    function provinceHasUnit(input, unitType) {
        return input.unit !== null && input.unit.type === unitType;
    }
}]);
