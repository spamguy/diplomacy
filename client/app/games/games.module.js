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
        resolve: {
            games: ['gameService', function(gameService) {
                return gameService.getAllOpenGames();
            }]
        },
        onEnter: ['userService', '$state', function(userService, $state) {
            if (!userService.isAuthenticated())
                $state.go('main.home');
        }]
    })
    .state('games.archive', {
        url: '/archive',
        controller: 'GameArchiveController as vm',
        templateUrl: 'app/games/archive/archive.html',
        resolve: {
            games: ['gameService', function(gameService) {
                return gameService.getAllArchivedGames();
            }]
        },
        onEnter: ['userService', '$state', function(userService, $state) {
            if (!userService.isAuthenticated())
                $state.go('main.home');
        }]
    })
    .state('games.new', {
        url: '/new',
        controller: 'NewGameController',
        templateUrl: 'app/games/new/new.html',
        resolve: {
            variants: ['gameService', function(gameService) {
                return gameService.getAllVariantNames();
            }]
        },
        onEnter: ['userService', '$state', function(userService, $state) {
            if (!userService.isAuthenticated())
                $state.go('main.home');
        }]
    })
    .state('games.view', {
        url: '/:id/{phaseIndex:int}',
        controller: 'ViewController',
        templateUrl: 'app/games/view/view.html',
        params: {
            phaseIndex: {
                value: null,
                squash: true,
                dynamic: true
            }
        },
        resolve: {
            game: ['gameService', '$stateParams', function(gameService, $stateParams) {
                return gameService.getGame($stateParams.id);
            }],
            phase: ['gameService', '$stateParams', function(gameService, $stateParams) {
                var phaseIndex = $stateParams.phaseIndex;
                if (phaseIndex > 0)
                    phaseIndex -= 1;
                return gameService.getPhase($stateParams.id, phaseIndex);
            }],
            svg: ['gameService', 'game', function(gameService, game) {
                return gameService.getVariantSVG(game.variant);
            }],
            powers: ['gameService', 'game', function(gameService, game) {
                return gameService.getPowerData(game.variant);
            }]
        },
        onEnter: ['userService', '$state', function(userService, $state) {
            if (!userService.isAuthenticated())
                $state.go('main.home');
        }]
    });
}]);
