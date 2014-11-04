'use strict';

angular.module('userService', ['LocalStorageModule'])
	.factory('userService', function($http, $window, localStorageService) {
		return {
			checkIfUserExists: function(username, callback) {
				$http.get('/publicapi/users/' + username + '/exists')
					.success(callback);
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