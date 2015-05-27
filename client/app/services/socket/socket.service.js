angular.module('socketService', ['btford.socket-io', 'userService'])
.factory('socketService', ['socketFactory', 'userService', function(socketFactory, userService) {
    'use strict';

    var socket = socketFactory({
        prefix: 'socket/',
        ioSocket: io.connect('http://localhost:9000')
    });

    // authenticate with JWT before sending actual socket command
    socket.on('connect', function() {
        socket.emit('authenticate', { token: userService.getToken() });
    });

    return socket;
}]);
