angular.module('gametools.component')
.controller('GameToolsController', ['userService', 'gameService', '$mdDialog', '$state', function(userService, gameService, $mdDialog, $state) {
    var vm = this,
        confirm;

    vm.service = gameService;
    vm.powerOwnsUnitInProvince = powerOwnsUnitInProvince;
    vm.getPowerList = getPowerList;
    vm.setReadyState = setReadyState;
    vm.currentUserInGame = gameService.getCurrentUserInGame(vm.game);

    vm.actions = {
        adjudicateNow: function() {
            confirm = $mdDialog.confirm()
                .title('Adjudicate')
                .textContent('Are you sure you want to adjudicate the current phase?')
                .ariaLabel('Adjudicate now?')
                .targetEvent(event)
                .ok('OK')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                gameService.adjudicateCurrentPhase(vm.game, function() {
                    $state.go('profile.games');
                });
            });
        },
        endGame: function() {
            confirm = $mdDialog.confirm()
                .title('Abort')
                .htmlContent('<p>Are you sure you want to abort this game?</p><ul><li>Players will not receive credit.</li><li>You run the risk of being scorned by your peers.</li></ul>')
                .ariaLabel('Abort game')
                .targetEvent(event)
                .ok('OK')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                gameService.endGame(vm.game, function() {
                    $state.go('profile.games');
                });
            });
        },
        excusePlayer: function() {
            // TODO: Allow excusing players without penalty.
            // Use custom dialog providing list of powers (not players).
        },
        bootPlayer: function() {
            // TODO: Allow booting players with penalty.
            // Use custom dialog providing list of powers (not players).
        },
        quitGame: function() {
            confirm = $mdDialog.confirm()
                .title('Quit')
                .htmlContent('<p>Are you sure you want to quit this game? If you really must go, ask the GM to excuse you. Otherwise:</p><ul><li>Your rank will suffer.</li><li>Your ability to join future games may suffer.</li><li>You will be judged with extreme prejudice by many generations to come.</li></ul>')
                .ariaLabel('Quit game')
                .targetEvent(event)
                .ok('OK')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                gameService.removePlayer(userService.getCurrentUserID(), vm.game, true, function() {
                    $state.go('profile.games');
                });
            });
        }
    };

    function powerOwnsUnitInProvince(code, province) {
        return province.unit && province.unit.owner === code;
    }

    function getPowerList() {
        var p;
        if (gameService.isGM(vm.game)) { // GMs see everyone.
            return vm.powers;
        }
        else {
            for (p = 0; p < vm.game.players.length; p++) {
                if (vm.game.players[p].player_id === userService.getCurrentUserID())
                    return _.pick(vm.powers, [vm.game.players[p].power]);
            }
        }
    }

    function setReadyState() {
        gameService.setReadyState(vm.game, gameService.getCurrentUserInGame(vm.game).isReady);
    }
}]);
