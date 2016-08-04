'use strict';

angular.module('games')
.controller('ViewController', ['$scope', 'userService', 'gameService', 'game', 'svg', 'powers', '$mdDialog', '$stateParams', function($scope, userService, gameService, game, svg, powers, $mdDialog, $stateParams) {
    $scope.updateProvinceData = updateProvinceData;

    $scope.powers = powers;
    $scope.game = game;
    $scope.readonly = userService.getCurrentUserID() === game.gm_id;
    $scope.currentUserInGame = gameService.getCurrentUserInGame(game);
    $scope.svg = new DOMParser().parseFromString(svg.data, 'image/svg+xml');
    $scope.phaseIndex = $stateParams.phase || 0;

    // Point out games that haven't started yet.
    if (game.status === 0) {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Not started')
                .ok('OK')
                .textContent('This game has not started yet. No powers have been assigned.')
                .ariaLabel('Game not started')
        );
    }

    function updateProvinceData(p, action, target, targetOfTarget) {
        // Update local data to reflect DB change.
        $scope.game.phases[0].provinces[p].unit.action = action;
        if (target)
            $scope.game.phases[0].provinces[p].unit.target = target;
        if (targetOfTarget)
            $scope.game.phases[0].provinces[p].unit.targetOfTarget = targetOfTarget;

        $scope.$broadcast('orderChange', {
            p: p
        });
    }
}]);
