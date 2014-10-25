'use strict';

angular.module('diplomacy')
	.controller('AppController', function ($scope, $http, userService) {
		$scope.currentUser = null;
		$scope.setCurrentUser = function(user) {
			$scope.currentUser = user;
		};
		$scope.isAuthenticated = userService.isAuthenticated;
	});
