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
            gameService: 'gameService',
            userService: 'userService',

            games: function(gameService) {
                return gameService.getAllGamesForCurrentUser();
            },
            gmGames: function(gameService) {
                return gameService.getAllGamesOwnedByCurrentUser();
            },
            currentUser: function(userService) {
                return userService.getUser(userService.getCurrentUser());
            }
        }
    })
    .state('profile.verify', {
        url: '/verify/{token}',
        controller: 'VerifyController',
        templateUrl: 'app/profile/verify/verify.html'
    })
    .state('profile.view', {
        url: '/{id:[0-9a-fA-F]{24}}',
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
