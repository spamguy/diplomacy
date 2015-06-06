angular.module('socketService', ['btford.socket-io', 'LocalStorageModule'])
.factory('socketService', ['socketFactory', 'localStorageService', function(socketFactory, localStorageService) {
    'use strict';

    var socket = socketFactory({
        prefix: 'socket/',
        ioSocket: io.connect('http://localhost:9000')
    });

    // authenticate with JWT before sending actual socket command
    socket.on('connect', function() {
        socket.on('authenticated', function() {
            // subscribe to all associated games after authenticating
            socket.emit('game:watch');
        });
        // userService.getToken() would be better, but that would create a circular dependency
        var token = localStorageService.get('token');
        if (token)
            socket.emit('authenticate', { token: token });
    });

    // app-specific things for which the socket should always listen
    socket.on('game:join:success', function(data) {
        console.log('A new player has joined game ' + data.gamename);
    });

    return socket;
}]);
