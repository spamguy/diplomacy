'use strict';

angular.module('profile')
	.controller('ProfileController', function ($scope, $state, Restangular, userService) {
		$scope.tabs = [
			{ 'heading': 'Games I\'m Playing', route: 'profile.playing', active: true },
			{ 'heading': 'Games I\'m Mastering', route: 'profile.gming', active: false }
		];
		//gameService.getAllForCurrentUser($scope.currentUser, function(data) { $scope.playing = data; });
		$scope.playing = [];
		Restangular.one('users', userService.getCurrentUser()).getList('games')
			.then(function(games) { 
				Restangular.copy(games.plain(), $scope.playing); });

		$scope.$on("$stateChangeSuccess", function() {
			$scope.tabs.forEach(function(tab) {
				tab.active = $scope.active(tab.route);
			});
		});

		$scope.active = function(route){
			return $state.is(route);
		};
		
		$scope.go = function(route) {
			$state.go(route);
		};
	});
