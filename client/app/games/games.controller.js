'use strict';

angular.module('games')
.controller('GameListController', ['$scope', 'user', 'gameService', function($scope, user, gameService) {
    $scope.variants = { };
    $scope.user = user; // 'user' has been resolved already; see games.module.js

    gameService.getAllOpenGames().then(function(games) {
        $scope.games = games;

        for (var i = 0; i < $scope.games.length; i++) {
            var theGame = $scope.games[i];

            // identify what variants need fetching
            var variantName = theGame.variant;
            if (!$scope.variants[variantName])
                $scope.variants[variantName] = { };
        }

        for (var key in $scope.variants)
            $scope.variants[key] = gameService.getVariant(key);
    });
}]);
