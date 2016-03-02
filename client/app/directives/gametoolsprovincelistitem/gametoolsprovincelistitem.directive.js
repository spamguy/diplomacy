angular.module('gametoolsprovincelistitem.directive', ['ngSanitize'])
.directive('sgProvinceListItem', ['$state', '$sce', 'gameService', function($state, $sce, gameService) {
    'use strict';

    return {
        replace: false,
        restrict: 'E',
        templateUrl: 'app/directives/gametoolsprovincelistitem/gametoolsprovincelistitem.tmpl.html',
        scope: {
            province: '='
        },
        link: function(scope, element, attrs) {
            var unitOwner = gameService.getUnitOwnerInRegion(scope.province),
                regionName = scope.province.r,
                provinceStatus;

            // Unit is in a subregion if region mentions subregions but unit owner does not.
            if (unitOwner && scope.province.sr && !unitOwner.sr)
                regionName += '/' + unitOwner.r;
            provinceStatus = '<strong>' + regionName + '</strong> ';

            if (unitOwner && unitOwner.unit.order) {
                switch (unitOwner.unit.order.action) {
                case 'move':
                    provinceStatus += '→ <strong>' + unitOwner.unit.order.y1 + '</strong>';
                    break;
                case 'support':
                    provinceStatus += 'supports <strong>' + unitOwner.unit.order.y1 + '</strong> ';
                    if (unitOwner.unit.order.y2)
                        provinceStatus += '→ <strong>' + unitOwner.unit.order.y2 + '</strong>';
                    break;
                case 'hold':
                    provinceStatus += 'holds';
                    break;
                case 'convoy':
                    provinceStatus += '~ <strong>' + _.last(unitOwner.unit.order.y1) + '</strong>';
                    break;
                case 'build':
                    provinceStatus += 'builds a'; break;
                case 'disband':
                    provinceStatus += 'disbands'; break;
                }
            }
            else {
                provinceStatus += '<em>awaiting orders</em>';
            }

            scope.provinceStatus = provinceStatus;
        }
    };
}]);
