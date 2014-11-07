'use strict';

angular.module('diplomacy.main')
	.controller('HomeController', function ($scope, gameService) {
		$scope.readonly = true;
		$scope.variant = gameService.getVariant('standard');
	});