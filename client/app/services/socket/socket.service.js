angular.module('socketService', ['btford.socket-io', 'LocalStorageModule'])
.factory('socketService', ['socketFactory', 'localStorageService', function(socketFactory, localStorageService) {
    'use strict';

    var socket = socketFactory({
        prefix: 'socket/',
        ioSocket: io.connect('http://localhost:9000')
    });

    // authenticate with JWT before sending actual socket command
    socket.on('connect', function() {
        // userService.getToken() would be better, but that would create a circular dependency
        var token = localStorageService.get('token');
        if (token)
            socket.emit('authenticate', { token: token });
    });

    return socket;
}]);
