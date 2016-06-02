'use strict';

angular.module('games')
.controller('ViewController', ['$scope', 'userService', 'gameService', 'variant', 'game', 'phase', 'svg', '$mdDialog', function($scope, userService, gameService, variant, game, phase, svg, $mdDialog) {
    $scope.updateProvinceData = updateProvinceData;

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

    function updateProvinceData(r, action, source, target) {
        var province = _.find($scope.phase.provinces, 'r', r),
            unitInProvince = gameService.getUnitOwnerInProvince(province);

        // Update local data to reflect DB change.
        unitInProvince.unit.order = { action: action };
        if (source)
            unitInProvince.unit.order.source = source;
        if (target)
            unitInProvince.unit.order.target = target;

        $scope.$broadcast('orderChange', {
            r: r
        });
    }
}]);
