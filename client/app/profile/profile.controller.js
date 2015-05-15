'use strict';

angular.module('profile')
    .controller('ProfileController', ['$scope', '$state', '$http', 'gameService', 'games', function ($scope, $state, $http, gameService, games) {
        $scope.selectedIndex = 0;

        $scope.variants = { };
        $scope.moves = { };

        $scope.playing = games;

        for (var i = 0; i < games.length; i++) {
            var theGame = games[i];
            // identify what variants need fetching
            var variantName = theGame.variant;
            if (!$scope.variants[variantName])
                $scope.variants[variantName] = { };

            /*
             * Identify the extent of each game's move data to get, given these rules:
             *     1) Old seasons are fully exposed: old positions, moves, resolution.
             *     2) Current seasons expose old positions.
             *     3) Players see their own orders in current seasons.
             *     4) GMs see everything in current seasons.
             */
            if (theGame.isAdmin)
                $scope.moves[theGame._id] = gameService.getMoveData(theGame._id);//.then(movesToScopeCallback);
            else
                $scope.moves[theGame._id] = gameService.getMoveDataForCurrentUser(theGame._id, theGame.year, theGame.season);//.then(movesToScopeCallback);
        }

        // populate keys
        for (var key in $scope.variants)
            $scope.variants[key] = gameService.getVariant(key);

        $scope.goToGame = function(game, variant, moves) {
            $state.go('games.view', { id: game._id });
        };
    }]);
