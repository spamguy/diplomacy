'use strict';

angular.module('diplomacy')
.controller('AppController', ['$rootScope', 'userService', '$state', function ($rootScope, userService, $state) {
    $rootScope.isAuthenticated = userService.isAuthenticated();

    $rootScope.logOut = function() {
        // TODO: delete user from local storage
        userService.unsetToken();
        $state.go('main.home');
    };
}]);
