'use strict';

angular.module('games')
.controller('GameListController', ['$scope', 'user', 'gameService', 'games', function($scope, user, gameService, games) {
    var i,
        theGame,
        variantName,
        key;
    $scope.variants = { };
    $scope.user = user; // 'user' has been resolved already; see games.module.js

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
}]);
