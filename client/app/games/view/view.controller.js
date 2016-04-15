'use strict';

angular.module('games')
.controller('ViewController', ['$scope', 'userService', 'gameService', 'variant', 'game', 'season', 'svg', '$mdDialog', function($scope, userService, gameService, variant, game, season, svg, $mdDialog) {
    $scope.updateRegionData = updateRegionData;

    $scope.variant = variant;
    $scope.game = game;
    $scope.season = season;
    $scope.readonly = userService.getCurrentUserID() === game.gm_id;
    $scope.svg = new DOMParser().parseFromString(svg.data, 'image/svg+xml');

    if (!season) {
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

    function updateRegionData(r, action, y1, y2) {
        var region = _.find($scope.season.regions, 'r', r),
            unitInRegion = gameService.getUnitOwnerInRegion(region);

        // Update local data to reflect DB change.
        unitInRegion.unit.order = { action: action };
        if (y1)
            unitInRegion.unit.order.y1 = y1;
        if (y2)
            unitInRegion.unit.order.y2 = y2;

        $scope.$broadcast('orderChange', {
            r: r
        });
    }
}]);
