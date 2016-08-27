'use strict';

angular.module('games')
.controller('ViewController', ['$scope', '$state', 'userService', 'gameService', 'game', 'svg', 'powers', '$mdDialog', '$stateParams', function($scope, $state, userService, gameService, game, svg, powers, $mdDialog, $stateParams) {
    var phaseCount = 0;

    $scope.updateProvinceData = updateProvinceData;

    $scope.powers = powers;
    $scope.game = game;
    $scope.readonly = userService.getCurrentUserID() === game.gm_id;
    $scope.currentUserInGame = gameService.getCurrentUserInGame(game);
    $scope.svg = new DOMParser().parseFromString(svg.data, 'image/svg+xml');

    // Because phases are ordered in reverse, count backwards.
    if (game.phases)
        phaseCount = game.phases.length;
    $scope.phaseIndex = phaseCount - ($stateParams.phaseIndex || phaseCount);

    $scope.$on('socket/phase:adjudicate:update', function(event, updatedGame) {
        // A game just adjudicated, but is it this one?
        if ($scope.game.id === updatedGame.id)
            $scope.game = updatedGame;
    });

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
