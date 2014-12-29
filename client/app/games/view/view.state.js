'use strict';

angular.module('games')
    .config(function ($stateProvider) {
    $stateProvider
        .state('games.view', {
            url: '/:id',
            controller: 'ViewController',
            templateUrl: 'app/games/view/view.html',
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
