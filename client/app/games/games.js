'use strict';

angular.module('diplomacy')
  .config(function ($stateProvider) {
    $stateProvider
		.state('games', {
			abstract: true,
			url: '/games',
			template: '<ui-view />'
		});
  });