'use strict';

angular.module('gameService', [])
	.factory('gameService', function($http, $window) {
		return {
			getAllForCurrentUser: function(id, callback) {
			$http.get('/api/games/' + id)
				.success(callback);
			}
		};
	}
);