angular.module('gametools.component')
.controller('GameToolsController', ['userService', 'gameService', '$scope', function(userService, gameService, $scope) {
    var vm = this;

    vm.currentPlayer = _.find(vm.game.players, 'player_id', userService.getCurrentUserID());

    vm.powerOwnsProvince = powerOwnsProvince;
    vm.getPowerList = getPowerList;
    vm.setReadyState = setReadyState;

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
