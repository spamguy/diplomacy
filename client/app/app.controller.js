'use strict';

angular.module('diplomacy')
.controller('AppController', ['$rootScope', 'userService', 'socketService', '$localStorage', '$state', function($rootScope, userService, socketService, $localStorage, $state) {
    $rootScope.$storage = $localStorage;

    $rootScope.logOut = function() {
        $localStorage.$reset();
        socketService.destroy();
        $state.go('main.home');
    };
}]);
