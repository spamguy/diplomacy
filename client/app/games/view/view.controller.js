'use strict';

angular.module('games')
    .controller('ViewController', function ($scope, $stateParams, gameService) {
        gameService.getGame($stateParams.id)
        .then(function(game) {
            var variant = gameService.getVariant(game.variant);

            $scope.variant = variant;

            if (game.isAdmin)
                $scope.season = gameService.getMoveData(game._id);
            else
                $scope.season = gameService.getMoveDataForCurrentUser(game._id);
        });
    });
