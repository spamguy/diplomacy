'use strict';

angular.module('games')
.controller('GameListController', ['$scope', 'userService', 'gameService', 'openGames', function($scope, userService, gameService, openGames) {
    $scope.variants = { };
    $scope.user = userService.getCurrentUser();

    var theGame,
        variantName,
        key,
        i;

    $scope.games = openGames;

    for (i = 0; i < $scope.games.length; i++) {
        theGame = $scope.games[i];

        // Identify what variants need fetching.
        variantName = theGame.variant;
        if (!$scope.variants[variantName])
            $scope.variants[variantName] = { };
    }

    for (key in $scope.variants)
        $scope.variants[key] = gameService.getVariant(key);
}]);
