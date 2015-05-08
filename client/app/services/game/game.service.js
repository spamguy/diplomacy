'use strict';

angular.module('gameService', ['userService', 'restangular'])
.factory('gameService', ['$http', 'userService', 'Restangular', function($http, userService, Restangular) {
    return {
        getAllForCurrentUser: function() {
            return Restangular.one('users', userService.getCurrentUser()).getList('games');
        },

        getVariant: function(variantName) {
            return $http.get('variants/' + variantName + '/' + variantName + '.json');
        },

        getAllVariantNames: function() {
            return Restangular.all('variants').getList();
        },

        getGame: function(gameID) {
            return Restangular.one('users', userService.getCurrentUser()).one('games', gameID).get();
        },

        getAllOpenGames: function() {
            return Restangular.all('games').getList();
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
        },

        createNewGame: function(game) {
            Restangular.all('games').post(game);
        }
    };
}]);
