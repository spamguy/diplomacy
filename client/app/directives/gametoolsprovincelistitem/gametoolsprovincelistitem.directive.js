angular.module('gametoolsprovincelistitem.directive', [])
.directive('sgProvinceListItem', ['$state', function($state) {
    'use strict';

    return {
        replace: false,
        restrict: 'E',
        templateUrl: 'app/directives/gametoolsprovincelistitem/gametoolsprovincelistitem.tmpl.html',
        scope: {
            province: '='
        },
        link: function(scope, element, attrs) {
        }
    };
}]);
