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
            scope.provinceStatus = '<strong>' + scope.province.r + '</strong>';
        }
    };
}]);
