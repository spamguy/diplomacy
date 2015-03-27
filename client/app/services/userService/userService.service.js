'use strict';

angular.module('userService', ['LocalStorageModule', 'restangular'])
.factory('userService', ['localStorageService', 'Restangular', function(localStorageService, Restangular) {
    return {
        userExists: function(username) {
            Restangular.setBaseUrl('/publicapi');
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
            Restangular.setBaseUrl('/api'); // FIXME: there's gotta be a better way to bounce between /api and /publicapi...
            return Restangular.one('users', userID).get();
        }
    };
}]);
