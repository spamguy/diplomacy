'use strict';

angular.module('loginService', [ ])
.factory('loginService', ['userService', 'socketService', '$state', '$rootScope', function(userService, socketService, $state, $rootScope) {
    return {
        validLoginCallback: function(data) {
            data = data.data; // data? data!

            // Set JWT.
            $rootScope.$storage.token = data.token;

            // Initialize socket voodoo.
            if (!socketService.socket)
                socketService.initialize();

            /*
             * Set up user data after successful login.
             * Not to be confused with setting up user data when logged in and after reloading page.
             */
            userService.getUser(data.id, function(user) {
                $rootScope.$storage.theUser = user;

                // Subscribe to all associated games after authenticating.
                socketService.socket.emit('game:watch');
                $state.go('profile.games');
            });
        }
    };
}]);
