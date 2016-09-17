'use strict';

angular.module('loginService', [ ])
.factory('loginService', ['userService', 'socketService', '$state', '$rootScope', function(userService, socketService, $state, $rootScope) {
    return {
        validLoginCallback: function(data) {
            data = data.data; // data? data!

            // Set JWT.
            userService.setToken(data.token);

            if (!socketService.socket)
                socketService.initialize();

            /*
             * Set up user data after successful login.
             * Not to be confused with setting up user data when logged in and after reloading page.
             */
            userService.setCurrentUser(data.id, function() {
                $rootScope.theUser = userService.getCurrentUser;
                $rootScope.isAuthenticated = userService.isAuthenticated;

                // Subscribe to all associated games after authenticating.
                socketService.socket.emit('game:watch');

                $state.go('profile.games');
            });
        }
    };
}]);
