angular.module('diplomacy')
.filter('hasUnit', ['gameService', function(gameService) {
    'use strict';

    return function(provinces, unitType) {
        return _.filter(provinces, function(r) {
            return gameService.getUnitOwnerInProvince(r, unitType) !== null;
        });
    };
}]);
