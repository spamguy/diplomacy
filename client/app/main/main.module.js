'use strict';

angular.module('diplomacy.main', [
	'ui.router',
	'directives.customvalidation.customValidationTypes',
	'signupform.directives',
	'ngAnimate',
	'userService',
	'gameService'
])
  .config(function ($stateProvider) {
    $stateProvider
	.state('main', {
		url: '',
		template: '<ui-view />',
		abstract: true
	})
	.state('main.home', {
	  url: '/',
	  templateUrl: 'app/main/home/home.html',
	  controller: 'HomeController'
	});
  });