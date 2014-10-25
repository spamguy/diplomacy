'use strict';

angular.module('diplomacy', [
	'ui.router',
	'ui.bootstrap',
	'games.directives',
	'diplomacy.main',
	'profile'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
	$httpProvider.interceptors.push('authInterceptor');
	
	$urlRouterProvider
		.otherwise('/');

	$locationProvider.html5Mode(true);
});