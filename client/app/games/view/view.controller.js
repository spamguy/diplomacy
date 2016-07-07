'use strict';

angular.module('games')
.controller('ViewController', ['$scope', 'userService', 'gameService', 'game', 'svg', 'powers', '$mdDialog', '$stateParams', function($scope, userService, gameService, game, svg, powers, $mdDialog, $stateParams) {
    $scope.updateProvinceData = updateProvinceData;

    $scope.powers = powers;
    $scope.game = game;
    $scope.readonly = userService.getCurrentUserID() === game.gm_id;
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
