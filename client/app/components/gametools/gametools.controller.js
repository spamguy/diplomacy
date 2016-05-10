angular.module('gametools.component')
.controller('GameToolsController', ['userService', 'gameService', '$mdDialog', '$scope', '$state', function(userService, gameService, $mdDialog, $scope, $state) {
    var vm = this,
        confirm;

    vm.service = gameService;
    vm.powerOwnsProvince = powerOwnsProvince;
    vm.getPowerList = getPowerList;
    vm.setReadyState = setReadyState;

    vm.actions = {
        adjudicateNow: function() {
            confirm = $mdDialog.confirm()
                .title('Adjudicate')
                .textContent('Are you sure you want to adjudicate the current season?')
                .ariaLabel('Adjudicate now?')
                .targetEvent(event)
                .ok('OK')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                gameService.adjudicateSeason(vm.season, function() {
                    $state.go('profile.games');
                });
            });
        },
        endGame: function() {
            confirm = $mdDialog.confirm()
                .title('Abort')
                .htmlContent('<p>Are you sure you want to abort this game?</p><ul><li>Players will not receive credit.</li><li>You run the risk of being scorned by your peers.</ul>')
                .ariaLabel('Really abort?')
                .targetEvent(event)
                .ok('OK')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                gameService.endGame(vm.game, function() {
                    $state.go('profile.games');
                });
            });
        }
    };

    function powerOwnsProvince(code, province) {
        return gameService.getUnitOwnerInRegion(province, null, code);
    }

    function getPowerList() {
        var currentUser = userService.getCurrentUserID(),
            p;

        if (currentUser === vm.game.gm_id) {
            // GMs see everyone.
            return vm.variant.powers;
        }
        else {
            for (p = 0; p < vm.game.players.length; p++) {
                if (vm.game.players[p].player_id === currentUser)
                    return _.pick(vm.variant.powers, [vm.game.players[p].power]);
            }
        }
    }

    function setReadyState() {
        gameService.setReadyState(vm.game, vm.currentPlayer.isReady);
    }
}]);
