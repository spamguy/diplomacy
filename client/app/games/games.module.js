'use strict';

angular.module('games', [
    'ui.router',
    'ngMaterial',
    'gametools.directive',
    'gametoolsprovincelistitem.directive'
])
.config(['$stateProvider', function($stateProvider) {
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
            user: function(userService) {
                return userService.getUser(userService.getCurrentUser());
            },
            variant: ['gameService', 'game', function(gameService, game) {
                return gameService.getVariant(game.variant);
            }],
            game: ['gameService', '$stateParams', function(gameService, $stateParams) {
                return gameService.getGame($stateParams.id);
            }],
            season: ['userService', 'gameService', 'game', function(userService, gameService, game) {
                // FIXME: This approach is probably totally exploitable. This decision making needs to happen server-side.
                // Identify whether current player is admin of this game.
                var playerID = userService.getCurrentUser(),
                    isAdmin = false;
                for (var p = 0; p < game.players.length; p++) {
                    if (game.players[p].power === '*' && game.players[p].player_id === playerID) {
                        isAdmin = true;
                        break;
                    }
                }

                if (isAdmin)
                    return gameService.getMoveData(game._id);
                else
                    return gameService.getMoveDataForCurrentUser(game._id);
            }]
        }
    });
}]);
