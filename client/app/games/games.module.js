'use strict';

angular.module('games', [
    'ui.router',
    'ngMaterial',
    'gametools.component',
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
            games: ['gameService', function(gameService) {
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
        url: '/{id:[0-9a-fA-F]{24}}/{year:int}/:season',
        controller: 'ViewController',
        templateUrl: 'app/games/view/view.html',
        data: {
            restricted: true
        },
        params: {
            year: {
                value: null,
                squash: true
            },
            season: {
                value: null,
                squash: true
            }
        },
        resolve: {
            variant: ['gameService', 'game', function(gameService, game) {
                return gameService.getVariant(game.variant);
            }],
            game: ['gameService', '$stateParams', function(gameService, $stateParams) {
                return gameService.getGame($stateParams.id);
            }],
            season: ['userService', 'gameService', 'game', '$stateParams', function(userService, gameService, game, $stateParams) {
                return gameService.getMoveData(game.id, $stateParams.year, $stateParams.season);
            }],
            svg: ['gameService', 'game', function(gameService, game) {
                return gameService.getVariantSVG(game.variant);
            }]
        }
    });
}]);
