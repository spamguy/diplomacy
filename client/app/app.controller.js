'use strict';

angular.module('diplomacy')
.controller('AppController', ['$rootScope', 'userService', 'localStorageService', '$state', function($rootScope, userService, localStorageService, $state) {
    $rootScope.isAuthenticated = userService.isAuthenticated();

    $rootScope.logOut = function() {
        localStorageService.clearAll();
        $state.go('main.home');
    };
}]);
