'use strict';

angular.module('diplomacy')
	.factory('userService', function($http, $window) {
		return {
			checkIfUserExists: function(username, callback) {
				$http.get('/publicapi/users/' + username + '/exists')
					.success(callback);
			},

			isAuthenticated: function() {
				return !!$window.sessionStorage.token;
			}
		};
	}
);