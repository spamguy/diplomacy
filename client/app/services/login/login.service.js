'use strict';

angular.module('loginService', [ ])
.factory('loginService', ['userService', 'socketService', '$state', function(userService, socketService, $state) {
    return {
        validLoginCallback: function(data) {
            data = data.data; // data? data!

            userService.setCurrentUser(data.id);
            userService.setToken(data.token);

            // with a token in hand now, authenticate with socket.io
            socketService.initialize();

            // redirect to profile
            $state.go('profile');
        }
    };
}]);
