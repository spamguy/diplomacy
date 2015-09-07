'use strict';

angular.module('userService', ['LocalStorageModule'])
.factory('userService', ['localStorageService', 'socketService', '$q',
function(localStorageService, socketService, $q) {
    return {
        isAuthenticated: function() {
            return !!localStorageService.get('token');
        },

        getToken: function() {
            return localStorageService.get('token');
        },

        setToken: function(token) {
            localStorageService.set('token', token);
        },

        unsetToken: function() {
            localStorageService.remove('token');
        },

        getCurrentUser: function() {
            return localStorageService.get('currentUser');
        },

        setCurrentUser: function(userID) {
            localStorageService.set('currentUser', userID);
        },

        getUser: function(userID) {
            return $q(function(resolve) {
                socketService.socket.emit('user:list', {
                    ID: userID
                }, function(users) {
                    resolve(users[0]);
                });
            });
        },
    };
}]);
