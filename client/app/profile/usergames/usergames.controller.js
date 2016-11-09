'use strict';

angular.module('profile')
.controller('UserGamesController', ['$localStorage', '$scope', '$stateParams', 'gameService', 'games', 'gmGames', function($localStorage, $scope, $stateParams, gameService, games, gmGames) {
    var i,
        theGame,
        variantName,
        key;

    $scope.selectedIndex = 0;

    $scope.variants = { };
    $scope.moves = { };

    $scope.playing = games;
    $scope.GMing = gmGames;

    if ($stateParams.token)
        $localStorage.token = $stateParams.token;

    for (i = 0; i < games.length; i++) {
        theGame = games[i];

        // Identify what variants need fetching.
        variantName = theGame.variant;
        if (!$scope.variants[variantName])
            $scope.variants[variantName] = { };

        /*
         * Identify the extent of each game's move data to get, given these rules:
         *     1) Old phases are fully exposed: old positions, moves, resolution.
         *     2) Current phases expose old positions.
         *     3) Players see their own orders in current phases.
         *     4) GMs see everything in current phases.
        if (theGame.isAdmin)
            $scope.moves[theGame.id] = gameService.getMoveData(theGame.id);//.then(movesToScopeCallback);
        else
            $scope.moves[theGame.id] = gameService.getMoveDataForCurrentUser(theGame.id, theGame.year, theGame.phase);//.then(movesToScopeCallback);
            */
    }

    // Populate keys.
    for (key in $scope.variants)
        $scope.variants[key] = gameService.getVariant(key);
}]);
