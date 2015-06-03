'use strict';

angular.module('userService', ['LocalStorageModule', 'restangular'])
.factory('userService', ['localStorageService', 'Restangular', 'socketService', '$q',
function(localStorageService, Restangular, socketService, $q) {
    return {
        userExists: function(username) {
            return Restangular.one('users', username).customGET('exists');
        },

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
                socketService.emit('user:list', {
                    ID: userID
                }, function(users) {
                    resolve(users[0]);
                });
            });
        }
    };
}]);
