angular.module('socketService', ['btford.socket-io'])
.factory('socketService', ['socketFactory', function(socketFactory) {
    'use strict';

    return socketFactory({
        prefix: 'socket/',
        ioSocket: io.connect('http://localhost:9000')
    });
}]);
