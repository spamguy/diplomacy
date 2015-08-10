'use strict';

angular.module('games', [
    'ui.router',
    'ngMaterial'
])
.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
    .state('games', {
        abstract: true,
        url: '/games',
        template: '<ui-view />'
    })
    .state('games.list', {
        url: '',
        controller: 'GameListController',
        templateUrl: 'app/games/games.html',
        data: {
            restricted: true
        },
        resolve: {
            userService: 'userService',
            user: function(userService) {
                return userService.getUser(userService.getCurrentUser());
            },
            auth: ['socketAuthService', function(socketAuthService) {
                return socketAuthService.getAuthenticatedAsPromise();
            }]
        }
    })
    .state('games.new', {
        url: '/new',
        controller: 'NewGameController',
        templateUrl: 'app/games/new/new.html',
        data: {
            restricted: true
        },
        resolve: {
            auth: ['socketAuthService', function(socketAuthService) {
                return socketAuthService.getAuthenticatedAsPromise();
            }],
            currentUser: ['userService', function(userService) {
                return userService.getUser(userService.getCurrentUser());
            }],
            variants: ['gameService', function(gameService) {
                return gameService.getAllVariantNames();
            }]
        }
    })
    .state('games.view', {
        url: '/{id:[0-9a-fA-F]{24}}',
        controller: 'ViewController',
        templateUrl: 'app/games/view/view.html',
        data: {
            restricted: true
        },
        resolve: {
            auth: ['socketAuthService', function(socketAuthService) {
                return socketAuthService.getAuthenticatedAsPromise();
            }],
            game: ['gameService', '$stateParams', function(gameService, $stateParams) {
                return gameService.getGame($stateParams.id);
            }]
        }
    });
}]);
