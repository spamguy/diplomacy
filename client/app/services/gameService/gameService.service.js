'use strict';

angular.module('gameService', ['userService', 'restangular'])
.factory('gameService', ['$http', 'userService', 'Restangular', function($http, userService, Restangular) {
    // promises, promises
    var getAllForCurrentUserPromise;

    return {
        getAllForCurrentUser: function() {
            if (!getAllForCurrentUserPromise)
                getAllForCurrentUserPromise = Restangular.one('users', userService.getCurrentUser()).getList('games');
            return getAllForCurrentUserPromise;
        },

        getVariant: function(variantName) {
            return $http.get('variants/' + variantName + '/' + variantName + '.json');
        },

        // TODO: figure out constraints (not too early, not too late) and hook up to DB
        getRandomStandardGame: function() {
            return {

            };
        },

        getGame: function(gameID) {
            return Restangular.one('users', userService.getCurrentUser()).one('games', gameID).get();
        },

        getMoveData: function(gameID, year, season) {
            var options = { };
            if (year)
                options.year = year;
            if (season)
                options.season = season;

            return Restangular.one('games', gameID).getList('moves', options);
        },

        getMoveDataForCurrentUser: function(gameID, year, season) {
            var options = { };
            if (year)
                options.year = year;
            if (season)
                options.season = season;

            return Restangular.one('users', userService.getCurrentUser()).one('games', gameID).getList('moves', options);
        }
    };
}]);
