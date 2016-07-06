angular.module('diplomacy')
.filter('provinceHasUnit', [function() {
    'use strict';

    return function(provinces, unitType) {
        return _.filter(provinces, function(p) {
            return p.unit && (!unitType || p.unit.type === unitType);
        });
    };
}]);
