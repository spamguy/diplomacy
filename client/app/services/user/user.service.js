'use strict';

angular.module('userService', ['LocalStorageModule'])
.factory('userService', ['localStorageService', 'socketService', '$q', '$rootScope',
function(localStorageService, socketService, $q, $rootScope) {
    var currentUserID;

    return {
        isAuthenticated: function() {
            return !!$rootScope.currentUser;
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
            return $rootScope.currentUser;
        },

        /**
         * Saves user info to service for convenient access.
         * @param  {string} [userID] The user ID.
         */
        setCurrentUser: function(userID) {
            if (userID)
                currentUserID = userID;
            this.getUser(currentUserID).then(function(user) {
                $rootScope.currentUser = user;
            });
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
