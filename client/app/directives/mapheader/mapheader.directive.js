angular.module('mapheader.directive', [])
.directive('sgMapHeader', [function() {
    'use strict';

    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/directives/mapheader/mapheader.tmpl.html',
        link: ['$scope', '$element', function($scope, $element) {

        }],
        controller: ['$scope', '$element', function($scope, $element) { // For exposing selected tool to map.directive.js

        }]
    };
}]);
