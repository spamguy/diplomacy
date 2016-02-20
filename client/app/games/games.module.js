'use strict';

angular.module('games', [
    'ui.router',
    'ngMaterial',
    'gametools.directive',
    'gametoolsprovincelistitem.directive',
    'vAccordion'
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
            openGames: ['gameService', function(gameService) {
                return gameService.getAllOpenGames();
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
            variant: ['gameService', 'game', function(gameService, game) {
                return gameService.getVariant(game.variant);
            }],
            game: ['gameService', '$stateParams', function(gameService, $stateParams) {
                return gameService.getGame($stateParams.id);
            }],
            season: ['userService', 'gameService', 'game', function(userService, gameService, game) {
                // FIXME: This approach is probably totally exploitable. This decision making needs to happen server-side.
                // Identify whether current player is admin of this game.
                var playerID = userService.getCurrentUser()._id,
                    isAdmin = game.gm_id === playerID;

                if (isAdmin)
                    return gameService.getMoveData(game._id);
                else
                    return gameService.getMoveDataForCurrentUser(game._id);
            }]
        }
    });
}]);
