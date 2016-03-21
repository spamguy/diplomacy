angular.module('map.directive')
.directive('sgMapHeader', [function() {
    'use strict';

    return {
        replace: true,
        restrict: 'E',
        require: '^sgMap',
        scope: false,
        templateUrl: 'app/directives/mapheader/mapheader.tmpl.html',
        link: function(scope) {
            scope.canMove = _.contains(scope.season.season.toLowerCase(), 'move');
            scope.canRetreat = _.contains(scope.season.season.toLowerCase(), 'retreat');
            scope.canBuild = _.contains(scope.season.season.toLowerCase(), 'adjust');
        }
    };
}]);
