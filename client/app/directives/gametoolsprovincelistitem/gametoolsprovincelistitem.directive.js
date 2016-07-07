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
                var unit = scope.province.unit,
                    provinceName = scope.province.p,
                    provinceStatus;

                // Unit is in a subprovince if province mentions subprovinces but unit owner does not.
                // if (unitOwner && scope.province.sr && !unitOwner.sr)
                    // provinceName += '/' + unitOwner.r;
                provinceStatus = '<strong>' + provinceName + '</strong> ';

                if (unit && unit.action) {
                    switch (unit.action) {
                    case 'move':
                        provinceStatus += '→ <strong>' + unit.target + '</strong>';
                        break;
                    case 'support':
                        provinceStatus += 'supports <strong>' + unit.order.source + '</strong> ';
                        if (unit.order.target)
                            provinceStatus += '→ <strong>' + unit.order.target + '</strong>';
                        break;
                    case 'hold':
                        provinceStatus += 'holds';
                        break;
                    case 'convoy':
                        provinceStatus += '~ <strong>' + unit.order.target + '</strong>';
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
