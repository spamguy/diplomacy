'use strict';

angular.module('games', [
	'ui.router'
])
  .config(function ($stateProvider) {
    $stateProvider
		.state('games', {
			abstract: true,
			url: '/games',
			template: '<ui-view />'
		});
  });