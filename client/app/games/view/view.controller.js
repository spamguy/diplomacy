'use strict';

angular.module('games')
    .controller('ViewController', function ($scope, $stateParams, gameService) {
        var theGame = gameService.getGame($stateParams.id);

        var movesToScopeCallback = function(moves) { $scope.moves = moves; };
        if (theGame.isAdmin)
            gameService.getMoveData(theGame._id).then(movesToScopeCallback);
        else
            gameService.getMoveDataForCurrentUser(theGame._id).then(movesToScopeCallback);
    });
