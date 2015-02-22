'use strict';

angular.module('diplomacy')
.controller('AppController', ['$rootScope', 'userService', function ($rootScope, userService) {
    $rootScope.isAuthenticated = userService.isAuthenticated();
}]);
