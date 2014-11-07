'use strict';

angular.module('gameService', ['userService', 'restangular'])
	.factory('gameService', function($http, userService, Restangular) {
		// promises, promises
		var getAllForCurrentUserPromise;

		return {
			getAllForCurrentUser: function() {
				if (!getAllForCurrentUserPromise)
					getAllForCurrentUserPromise = Restangular.one('users', userService.getCurrentUser()).getList('games');
				return getAllForCurrentUserPromise;
			},

			getVariant: function(variantName) {
				return null;
			},
		};
	}
);