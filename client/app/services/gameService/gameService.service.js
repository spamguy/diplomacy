'use strict';

angular.module('gameService', ['userService'])
	.factory('gameService', function($http, userService) {
		return {
			getAllForCurrentUser: function(callback) {
				$http.get('/api/users/' + userService.getCurrentUser() + '/games')
					.success(callback);
			}
		};
	}
);