'use strict';

angular.module('loginService', [ ])
.factory('loginService', ['userService', 'socketService', 'socketAuthService', '$state', function(userService, socketService, socketAuthService, $state) {
    return {
        validLoginCallback: function(data) {
            data = data.data; // data? data!

            userService.setCurrentUser(data.id);
            userService.setToken(data.token);

            // with a token in hand now, authenticate with socket.io
            //socketService.initialize();


            // redirect to profile
            socketAuthService.getAuthenticatedAsPromise().then(function() {
                // subscribe to all associated games after authenticating
                socketService.socket.emit('game:watch');

                $state.go('profile');
            });
        }
    };
}]);
