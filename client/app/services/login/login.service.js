'use strict';

angular.module('loginService', [ ])
.factory('loginService', ['userService', 'socketService', '$state', function(userService, socketService, $state) {
    return {
        validLoginCallback: function(data) {
            data = data.data; // data? data!

            userService.setCurrentUser(data.id, data.email);
            userService.setToken(data.token);

            // subscribe to all associated games after authenticating
            socketService.socket.emit('game:watch');

            $state.go('profile.games');
        }
    };
}]);
