'use strict';

angular.module('gameService', [])
	.factory('gameService', function($http, $window) {
		return {
			getAllForCurrentUser: function(id, callback) {
				$http.get('/api/users/' + id + '/games')
					.success(callback);
			}
		};
	}
);