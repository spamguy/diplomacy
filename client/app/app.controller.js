'use strict';

angular.module('diplomacy')
    .controller('AppController', function ($rootScope, $http, userService, localStorageService) {
        $rootScope.isAuthenticated = userService.isAuthenticated();
    });
