'use strict';

angular.module('profile')
	.controller('ProfileController', function ($scope) {
		$scope.tabs = [
		];
		
		$scope.go = function(route) {
			$state.go(route);
		};
	});
