'use strict';

angular.module('diplomacy')
.controller('AppController', ['$rootScope', 'userService', 'localStorageService', '$state', function($rootScope, userService, localStorageService, $state) {
    $rootScope.logOut = function() {
        userService.clearUser();
        $state.go('main.home');
    };
}]);
