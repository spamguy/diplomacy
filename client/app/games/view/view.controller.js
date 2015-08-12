'use strict';

angular.module('games')
.controller('ViewController', ['$scope', 'gameService', 'userService', 'game', function ($scope, gameService, userService, game) {
    var variant = gameService.getVariant(game.variant);

    $scope.variant = variant;

    // identify whether current player is admin of this game
    var playerID = userService.getCurrentUser(),
        isAdmin = false;
    for (var p = 0; p < game.players.length; p++) {
        if (game.players[p].power === '*' && game.players[p].player_id === playerID) {
            isAdmin = true;
            break;
        }
    }
    $scope.isAdmin = isAdmin;

    if (isAdmin)
        $scope.season = gameService.getMoveData(game._id);
    else
        $scope.season = gameService.getMoveDataForCurrentUser(game._id);
}]);
