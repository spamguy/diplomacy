'use strict';

angular.module('profile', [
    'ui.router',
    'gameService',
    'ngMaterial'
])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('profile', {
        url: '/profile',
        abstract: true,
        template: '<ui-view />'
    })
    .state('profile.games', {
        url: '/games',
        templateUrl: 'app/profile/usergames/usergames.html',
        controller: 'UserGamesController',
        data: {
            restricted: true
        },
        resolve: {
            games: ['gameService', function(gameService) {
                return gameService.getAllActiveGamesForCurrentUser();
            }],
            gmGames: ['gameService', function(gameService) {
                return gameService.getAllActiveGamesOwnedByCurrentUser();
            }]
        }
    })
    .state('profile.verify', {
        url: '/verify/{token}',
        controller: 'VerifyController',
        templateUrl: 'app/profile/verify/verify.html'
    })
    .state('profile.view', {
        url: '/:id',
        templateUrl: 'app/profile/view/view.html',
        controller: 'ProfileViewController',
        data: {
            restricted: true
        }
    })
    .state('profile.edit', {
        url: '/edit',
        templateUrl: 'app/profile/edit/edit.html',
        controller: 'ProfileEditController',
        data: {
            restricted: true
        }
    });
}]);
