angular.module('map.directive')
.directive('sgMapHeader', [function() {
    'use strict';

    return {
        replace: true,
        restrict: 'E',
        require: '^sgMap',
        scope: false,
        templateUrl: 'app/directives/mapheader/mapheader.tmpl.html'
    };
}]);
