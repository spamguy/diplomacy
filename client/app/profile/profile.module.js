'use strict';

angular.module('profile', [
	'ui.router',
  'ui.bootstrap',
  'gameService'
])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/profile/playing");
    $stateProvider
      .state('profile', {
        url: '/profile',
        templateUrl: 'app/profile/profile.html',
        controller: 'ProfileController',
        data: {
        	restricted: true
        }
      })
      .state('profile.playing', {
        url: '/playing',
        templateUrl: 'templates/profile/playing.tmpl.html'
      })
      .state('profile.gming', {
        url: '/gming',
        templateUrl: 'templates/profile/gming.tmpl.html'
      });
  });