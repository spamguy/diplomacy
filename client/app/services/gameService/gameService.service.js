'use strict';

angular.module('gameService', ['userService', 'restangular'])
	.factory('gameService', function($http, userService, Restangular) {
		return {
			getAllForCurrentUser: function(callback) {
				Restangular.one('users', userService.getCurrentUser()).getList('games')
					.then(callback);
			}
		};
	}
);