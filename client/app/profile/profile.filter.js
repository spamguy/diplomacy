'use strict';

angular.module('profile')
    .filter('gmStatus', function() {
        return function(games, status) {
            var filtered = [];

            // add games whose admin flag matches filter's (playing -> false, GMing -> true)
            var game;
            for (var g = 0; g < games.length; g++) {
                game = games[g];
                if (game.isAdmin === status)
                    filtered.push(game);
            }

            return filtered;
        };
    });
