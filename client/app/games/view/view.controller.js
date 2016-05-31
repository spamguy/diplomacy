'use strict';

angular.module('games')
.controller('ViewController', ['$scope', 'userService', 'gameService', 'variant', 'game', 'phase', 'svg', '$mdDialog', function($scope, userService, gameService, variant, game, phase, svg, $mdDialog) {
    $scope.updateRegionData = updateRegionData;

    $scope.variant = variant;
    $scope.game = game;
    $scope.phase = phase;
    $scope.readonly = userService.getCurrentUserID() === game.gm_id;
    $scope.svg = new DOMParser().parseFromString(svg.data, 'image/svg+xml');

    // Point out games that haven't started yet.
    if (!phase && game.status === 0) {
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

    function updateRegionData(r, action, source, target) {
        var region = _.find($scope.phase.regions, 'r', r),
            unitInRegion = gameService.getUnitOwnerInRegion(region);

        // Update local data to reflect DB change.
        unitInRegion.unit.order = { action: action };
        if (source)
            unitInRegion.unit.order.source = source;
        if (target)
            unitInRegion.unit.order.target = target;

        $scope.$broadcast('orderChange', {
            r: r
        });
    }
}]);
