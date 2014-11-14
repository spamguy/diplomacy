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

			// TODO: hook up to DB
			getVariant: function(variantName) {
				return { name: 'standard' };
			},

			// TODO: figure out constraints (not too early, not too late) and hook up to DB
			getRandomStandardGame: function() {
				return {

				};
			}
		};
	}
);