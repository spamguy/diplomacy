angular.module('gametools.directive', [])
.directive('sgGameTools', ['$state', function($state) {
    'use strict';

    return {
        replace: false,
        restrict: 'E',
        templateUrl: 'app/directives/gametools/gametools.tmpl.html',
        scope: {
            season: '=',
            variant: '='
        },
        link: function(scope, element, attrs) {
            scope.powerOwnsProvince = function(code, province) {
                return province.unit && province.unit.power === code;
            };
        }
    };
}]);
