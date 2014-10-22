'use strict';

angular.module('diplomacy')
	.factory('userService', function($http) {
		return {
			checkIfUserExists: function(username, callback) {
				$http.get('/publicapi/users/' + username + '/exists')
					.success(callback);
			}
		};
	}
);