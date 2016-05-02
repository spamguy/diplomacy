angular.module('gametoolsprovincelistitem.directive', ['ngSanitize'])
.directive('sgProvinceListItem', ['$state', '$sce', 'gameService', function($state, $sce, gameService) {
    'use strict';

    return {
        replace: false,
        restrict: 'E',
        templateUrl: 'app/directives/gametoolsprovincelistitem/gametoolsprovincelistitem.tmpl.html',
        scope: true,
        link: function(scope, element, attrs) {
            scope.provinceStatus = generateProvinceStatus();

            scope.$on('orderChange', function(event, data) {
                // FIXME: This can't be the best way to refresh this directive...can it?
                if (data.r === scope.province.r)
                    scope.provinceStatus = generateProvinceStatus();
            });

            function generateProvinceStatus() {
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
                        provinceStatus += '→ <strong>' + unitOwner.unit.order.target + '</strong>';
                        break;
                    case 'support':
                        provinceStatus += 'supports <strong>' + unitOwner.unit.order.source + '</strong> ';
                        if (unitOwner.unit.order.target)
                            provinceStatus += '→ <strong>' + unitOwner.unit.order.target + '</strong>';
                        break;
                    case 'hold':
                        provinceStatus += 'holds';
                        break;
                    case 'convoy':
                        provinceStatus += '~ <strong>' + unitOwner.unit.order.target + '</strong>';
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

                return provinceStatus;
            }
        }
    };
}]);
