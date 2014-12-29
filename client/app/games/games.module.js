'use strict';

angular.module('games', [
    'ui.router'
])
.config(function ($stateProvider) {
    $stateProvider
    .state('games', {
        abstract: true,
        url: '/games',
        template: '<ui-view />'
    })
    .state('games.view', {
        url: '/:id',
        controller: 'ViewController',
        templateUrl: 'app/games/view/view.html',
        data: {
            restricted: true
        },
        resolve: {
            gameService: 'gameService',
            game: function(gameService, $stateParams) {
                return gameService.getGame($stateParams.id);
            },

            variant: function(gameService, game) {
                return gameService.getVariant(game.variant);
            }
        }
    });
});
