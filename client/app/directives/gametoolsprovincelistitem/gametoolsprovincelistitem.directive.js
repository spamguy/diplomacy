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
                    provinceStatus += '→ '; break;
                case 'support':
                    provinceStatus += 'supports '; break;
                case 'hold':
                    provinceStatus += 'holds '; break;
                case 'convoy':
                    provinceStatus += 'convoys '; break;
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
