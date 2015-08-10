/**
 * @ngdoc service
 * @name gameService
 * @description Interacts with game, variant, and move data.
 */
angular.module('gameService', ['userService', 'socketService'])
.factory('gameService', ['$http', 'userService', 'socketService', '$q', function($http, userService, socketService, $q) {
    'use strict';

    return {
        /**
         * Gets all games associated with the logged-in user.
         * @memberof GameService
         * @returns {Promise<array>} A list of games.
         */
        getAllForCurrentUser: function() {
            return $q(function(resolve) {
                socketService.socket.emit('game:userlist', {
                    playerID: userService.getCurrentUser()
                }, function(games) {
                    resolve(games);
                });
            });
        },

        getVariant: function(variantName) {
            // strip spaces
            variantName = variantName.replace(' ', '');
            return $http.get('variants/' + variantName + '/' + variantName + '.json');
        },

        getAllVariantNames: function() {
            return $q(function(resolve) {
                socketService.socket.emit('variant:list', { }, function(variants) {
                    resolve(variants);
                });
            });
        },

        getGame: function(gameID) {
            return $q(function(resolve) {
                socketService.socket.emit('game:list', { gameID: gameID }, function(games) {
                    resolve(games[0]);
                });
            });
        },

        getAllOpenGames: function() {
            return $q(function(resolve) {
                socketService.socket.emit('game:listopen', function(games) {
                    resolve(games);
                });
            });
        },

        getMoveData: function(gameID, year, season) {
            var options = { gameID: gameID };
            if (year)
                options.year = year;
            if (season)
                options.season = season;

            return $q(function(resolve) {
                socketService.socket.emit('season:list', options, function(seasons) {
                    resolve(seasons);
                });
            });
        },

        getMoveDataForCurrentUser: function(gameID, year, season) {
            var options = { gameID: gameID };
            if (year)
                options.year = year;
            if (season)
                options.season = season;

            return $q(function(resolve) {
                socketService.socket.emit('season:list', options, function(seasons) {
                    resolve(seasons);
                });
            });
        },

        createNewGame: function(game) {
            socketService.socket.emit('game:create', { game: game });
        },

        /**
         * @description Signs the current user up for a game.
         * @param {Object} game    A game.
         * @param {Object} [options] Power preferences, if allowed.
         */
        joinGame: function(game, options) {
            options = options || { };
            options.gameID = game._id;
            socketService.socket.emit('game:join', options);
        },

        isAdmin: function(game) {
            for (var p = 0; p < game.players.length; p++) {
                if (game.players[p].power === '*' && game.players[p].player_id === userService.getCurrentUser())
                    return true;
            }

            // no admin found with ID pairing
            return false;
        }
    };
}]);
