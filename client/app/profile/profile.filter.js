'use strict';

angular.module('profile')
.filter('gmStatus', ['gameService', function(gameService) {
    return function(games, status) {
        var filtered = [],
            game,
            g;

        // Add games whose admin flag matches filter's (playing -> false, GMing -> true).
        for (g = 0; g < games.length; g++) {
            game = games[g];
            if (gameService.isAdmin(game) === status)
                filtered.push(game);
        }

        return filtered;
    };
}]);
