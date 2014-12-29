'use strict';

angular.module('profile')
    .controller('ProfileController', function ($scope, $state, $http, userService, gameService, games) {
        $scope.tabs = [
            { 'heading': 'Games I\'m Playing', route: 'profile.playing', active: true },
            { 'heading': 'Games I\'m Mastering', route: 'profile.gming', active: false }
        ];

        $scope.variants = { };
        $scope.moves = { };

        $scope.playing = games;

        var movesToScopeCallback = function(moves) { $scope.moves[theGame._id] = moves; };
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
                gameService.getMoveData(theGame._id).then(movesToScopeCallback);
            else
                gameService.getMoveDataForCurrentUser(theGame._id, theGame.year, theGame.season).then(movesToScopeCallback);
        }

        // populate keys
        var varsToScopeCallback = function(variant) {
            $scope.variants[key] = variant.data; };
        for (var key in $scope.variants)
            gameService.getVariant(key).then(varsToScopeCallback);

        // $scope.$on("$stateChangeSuccess", function() {
        //  $scope.tabs.forEach(function(tab) {
        //      tab.active = $scope.active(tab.route);
        //  });
        // });
        $scope.goToGame = function(game, variant, moves) {
            $state.go('games.view', { id: game._id });
        };

        $scope.active = function(route){
            return $state.is(route);
        };

        $scope.go = function(route) {
            $state.go(route);
        };
    });
