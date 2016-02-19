'use strict';

angular.module('games')
.controller('GameListController', ['$scope', 'userService', 'gameService', function($scope, userService, gameService) {
    $scope.variants = { };
    $scope.user = userService.getCurrentUser();

    gameService.getAllOpenGames().then(function(games) {
        var theGame,
            variantName,
            key,
            i;

        $scope.games = games;

        for (i = 0; i < $scope.games.length; i++) {
            theGame = $scope.games[i];

            // Identify what variants need fetching.
            variantName = theGame.variant;
            if (!$scope.variants[variantName])
                $scope.variants[variantName] = { };
        }

        for (key in $scope.variants)
            $scope.variants[key] = gameService.getVariant(key);
    });
}]);
