angular.module('diplomacy')
.filter('hasUnit', ['gameService', function(gameService) {
    'use strict';

    return function(regions, unitType) {
        return _.filter(regions, function(r) {
            return gameService.getUnitOwnerInRegion(r, unitType) !== null;
        });
    };
}]);
