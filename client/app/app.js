'use strict';

angular.module('diplomacy', [
	'ui.router',
	'ui.bootstrap',
	'games.directives',
	'diplomacy.main'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
	$urlRouterProvider
		.otherwise('/');

		$locationProvider.html5Mode(true);
});