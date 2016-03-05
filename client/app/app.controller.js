'use strict';

angular.module('diplomacy')
.controller('AppController', ['$rootScope', 'userService', 'localStorageService', '$state', function($rootScope, userService, localStorageService, $state) {
    $rootScope.logOut = function() {
        delete $rootScope.currentUser;
        delete $rootScope.isAuthenticated;

        localStorageService.clearAll();
        $state.go('main.home');
    };
}]);
