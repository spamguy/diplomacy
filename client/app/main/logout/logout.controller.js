'use strict';

angular.module('diplomacy.main')
.controller('LogoutController', ['userService', 'socketService', '$state', 'localStorageService', function(userService, socketService, $state, localStorageService) {
    localStorageService.clearAll();

    // disconnect socket
    if (socketService.socket)
        socketService.socket.disconnect();
    socketService.socket = null;

    $state.go('main.home');
}]);
