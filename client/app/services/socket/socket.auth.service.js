angular.module('socketAuthService', [])
.factory('socketAuthService', ['socketService', '$q', function(socketService, $q) {
    'use strict';

    return {
        getAuthenticatedAsPromise: function() {
            var listenForAuthentication = function() {
                socketService.socket.connect();
                var listenDeferred = $q.defer();
                var authCallback = function() {
                    listenDeferred.resolve(true);
                };
                socketService.socket.on('authenticated', authCallback);
                return listenDeferred.promise;
            };

            if (!socketService.socket) {
                socketService.initialize();
                return listenForAuthentication();
            }
            else {
                if (socketService.getAuthenticated())
                    return $q.when(true);
                else
                    return listenForAuthentication();
            }
        }
    };
}]);
