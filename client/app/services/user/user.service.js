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

        getCurrentUserID: function() {
            return localStorageService.get('currentUserID');
        },

        getCurrentUser: function() {
            var currentUserID = this.getCurrentUserID();
            if (!currentUserID)
                return null;

            return this.getUser(currentUserID);
        },

        setCurrentUser: function(userID) {
            localStorageService.set('currentUserID', userID);
        },

        getUser: function(userID) {
            return $q(function(resolve) {
                socketService.socket.emit('user:list', {
                    ID: userID
                }, function(users) {
                    resolve(users[0]);
                });
            });
        }
    };
}]);
