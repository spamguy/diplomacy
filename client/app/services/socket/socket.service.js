// Service adapted from http://wmyers.github.io/technical/nodejs/Simple-JWT-auth-for-SocketIO/
angular.module('socketService', ['btford.socket-io', 'LocalStorageModule', 'ngMaterial'])
.factory('socketService', ['socketFactory', 'localStorageService', '$mdToast', 'CONST', function(socketFactory, localStorageService, $mdToast, CONST) {
    'use strict';

    var socket,
        self = { };

    self.initialize = function() {
        self.socket = socket = socketFactory({
            prefix: 'socket/',
            ioSocket: io.connect(CONST.socketEndpoint, {
                secure: true,
                query: 'token=' + localStorageService.get('token')
            })
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

        socket.on('game:start:announce', function(data) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent('The game ' + data.gamename + ' has started!')
                    .hideDelay(5000)
            );
        });
    };

    return self;
}]);
