angular.module('gametoolsprovincelistitem.directive', ['ngSanitize'])
.directive('sgProvinceListItem', ['$state', '$sce', function($state, $sce) {
    'use strict';

    return {
        replace: false,
        restrict: 'E',
        templateUrl: 'app/directives/gametoolsprovincelistitem/gametoolsprovincelistitem.tmpl.html',
        scope: {
            province: '='
        },
        link: function(scope, element, attrs) {
            var provinceStatus = '<strong>' + scope.province.r + '</strong> ';

            if (scope.province.unit && scope.province.unit.order) {
                switch (scope.province.unit.order.action) {
                case 'move':
                    provinceStatus += '→ <strong>' + scope.province.unit.order.y1 + '</strong>';
                    break;
                case 'support':
                    provinceStatus += 'supports <strong>' + scope.province.unit.order.y1 + '</strong> ';
                    if (scope.province.unit.order.y2)
                        provinceStatus += '→ <strong>' + scope.province.unit.order.y2 + '</strong>';
                    break;
                case 'hold':
                    provinceStatus += 'holds';
                    break;
                case 'convoy':
                    provinceStatus += '~ <strong>' + _.last(scope.province.unit.order.y1) + '</strong>';
                    break;
                case 'build':
                    provinceStatus += 'builds a'; break;
                case 'disband':
                    provinceStatus += 'disbands'; break;
                }
            }

            scope.provinceStatus = provinceStatus;
        }
    };
}]);
