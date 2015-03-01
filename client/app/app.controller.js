'use strict';

angular.module('diplomacy')
.controller('AppController', ['$rootScope', 'userService', '$state', function ($rootScope, userService, $state) {
    $rootScope.isAuthenticated = userService.isAuthenticated();

    $rootScope.logOut = function() {
        userService.unsetToken();
        $state.go('main.home');
    };
}]);
