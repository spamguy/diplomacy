'use strict';

angular.module('profile')
    .controller('ProfileController', function ($scope, $state, $http, userService, gameService) {
        $scope.tabs = [
            { 'heading': 'Games I\'m Playing', route: 'profile.playing', active: true },
            { 'heading': 'Games I\'m Mastering', route: 'profile.gming', active: false }
        ];

        $scope.variants = { };

        $scope.playing = [];
        gameService.getAllForCurrentUser().then(function(games) {
            $scope.playing = games;

            for (var i = 0; i < games.length; i++) {
                var variantName = games[i].variant;
                if (!$scope.variants[variantName])
                    $scope.variants[variantName] = { }; // add placeholder object
            }

            // populate keys with promises
            for (var key in $scope.variants)
                $scope.variants[key] = gameService.getVariant(key);
        });

        // $scope.$on("$stateChangeSuccess", function() {
        //  $scope.tabs.forEach(function(tab) {
        //      tab.active = $scope.active(tab.route);
        //  });
        // });

        $scope.active = function(route){
            return $state.is(route);
        };

        $scope.go = function(route) {
            $state.go(route);
        };
    });
