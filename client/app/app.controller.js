'use strict';

angular.module('diplomacy')
.controller('AppController', ['$rootScope', 'userService', '$state', function($rootScope, userService, $state) {
    $rootScope.isAuthenticated = userService.isAuthenticated();
    $rootScope.userEmail = userService.getCurrentUserEmail();

    $rootScope.logOut = function() {
        // TODO: Delete user/user email from local storage.
        userService.unsetToken();
        $state.go('main.home');
    };
}]);
