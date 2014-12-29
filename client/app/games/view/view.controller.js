'use strict';

angular.module('games')
    .controller('ViewController', function ($scope, $stateParams, gameService, variant, game) {
        $scope.variant = variant.data;
        var movesToScopeCallback = function(moves) { $scope.moves = moves; };
        if (game.isAdmin)
            gameService.getMoveData(game._id).then(movesToScopeCallback);
        else
            gameService.getMoveDataForCurrentUser(game._id).then(movesToScopeCallback);
    });
