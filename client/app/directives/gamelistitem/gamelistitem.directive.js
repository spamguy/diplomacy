angular.module('gamelistitem.directive', [])
.directive('sgGameListItem', [function() {
    'use strict';

    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/directives/gamelistitem/gamelistitem.tmpl.html',
        link: function(scope, element, attrs) {

        }
    };
}]);
