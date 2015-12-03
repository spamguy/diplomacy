// Service adapted from http://wmyers.github.io/technical/nodejs/Simple-JWT-auth-for-SocketIO/
angular.module('socketService', ['btford.socket-io', 'LocalStorageModule', 'ngMaterial'])
.factory('socketService', ['socketFactory', 'localStorageService', '$mdToast', function(socketFactory, localStorageService, $mdToast) {
    'use strict';

    var socket, ioSocket, isAuthenticated,
        self = {
            getAuthenticated: function() {
                return isAuthenticated;
            }
        };

    self.socket = socket;

    self.initialize = function() {
        isAuthenticated = false;

        self.socket = socket = socketFactory({
            prefix: 'socket/',
            ioSocket: io.connect('https://localhost:9000')
        });

        // authenticate with JWT before sending actual socket command
        socket.on('connect', function() {
            // userService.getToken() would be better, but that would create a circular dependency
            var token = localStorageService.get('token');
            // if (token)
            socket.emit('authenticate', { token: token });
        });

        socket.on('authenticated', function() {
            isAuthenticated = true;
        });

        // TODO: move to GameService
        socket.on('game:join:announce', function(data) {
            $mdToast.show(
                $mdToast.simple()
                    .content('A new player has joined game ' + data.gamename + '.')
                    .hideDelay(5000)
            );
        });

        socket.on('game:create:success', function(data) {
            $mdToast.show(
                $mdToast.simple()
                    .content('The game ' + data.gamename + ' has been created.')
                    .hideDelay(5000)
            );
        });

        socket.on('game:join:success', function(data) {
            $mdToast.show(
                $mdToast.simple()
                    .content('You have joined the game ' + data.gamename + '.')
                    .hideDelay(5000)
            );
        });
    };

    return self;
}]);
