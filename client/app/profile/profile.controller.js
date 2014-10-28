'use strict';

angular.module('profile')
	.controller('ProfileController', function ($scope, $state) {
		$scope.tabs = [
			{ 'heading': 'Games I\'m Playing', route: 'profile.playing', active: true },
			{ 'heading': 'Games I\'m Mastering', route: 'profile.gming', active: false }
		];

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
