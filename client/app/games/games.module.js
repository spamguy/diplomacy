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
        url: '/:id/{phase:int}',
        controller: 'ViewController',
        templateUrl: 'app/games/view/view.html',
        data: {
            restricted: true
        },
        params: {
            phase: {
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
            svg: ['gameService', 'game', function(gameService, game) {
                return gameService.getVariantSVG(game.variant);
            }]
        }
    });
}]);
