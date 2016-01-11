// Service adapted from http://wmyers.github.io/technical/nodejs/Simple-JWT-auth-for-SocketIO/
angular.module('socketService', ['btford.socket-io', 'LocalStorageModule', 'ngMaterial'])
.factory('socketService', ['socketFactory', 'localStorageService', '$mdToast', 'CONST', function(socketFactory, localStorageService, $mdToast, CONST) {
    'use strict';

    var socket,
        isAuthenticated,
        self = {
            getAuthenticated: function() {
                return isAuthenticated;
            }
        };

    self.initialize = function() {
        isAuthenticated = false;

        self.socket = socket = socketFactory({
            prefix: 'socket/',
            ioSocket: io.connect(CONST.socketEndpoint, {
                secure: true,
                query: 'token=' + localStorageService.get('token')
            })
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
                    .textContent('The game ' + data.gamename + ' has been created.')
                    .hideDelay(5000)
            );
        });

        socket.on('game:join:success', function(data) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent('You have joined the game ' + data.gamename + '.')
                    .hideDelay(5000)
            );
        });
    };

    return self;
}]);
