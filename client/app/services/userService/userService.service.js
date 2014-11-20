'use strict';

angular.module('userService', ['LocalStorageModule', 'restangular'])
    .factory('userService', function(localStorageService, Restangular) {
        return {
            // no promise desired, because cached data is of limited use here
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

            getRefreshToken: function() {
                return localStorageService.get('refreshtoken');
            },

            setRefreshToken: function(token) {
                localStorageService.set('refreshtoken', token);
            },

            getCurrentUser: function() {
                return localStorageService.get('currentUser');
            },

            setCurrentUser: function(userID) {
                localStorageService.set('currentUser', userID);
            }
        };
    }
);
