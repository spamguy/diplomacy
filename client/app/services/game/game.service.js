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
         * Gets all games the logged-in user has played in.
         * @memberof GameService
         * @returns {Promise<array>} A list of games.
         */
        getAllGamesForCurrentUser: function() {
            return $q(function(resolve) {
                socketService.socket.emit('game:userlist', {
                    playerID: userService.getCurrentUserID()
                }, function(games) {
                    resolve(games);
                });
            });
        },

        /**
         * Gets all games owned by the logged-in user.
         * @memberof GameService
         * @returns {Promise<array>} A list of games.
         */
        getAllGamesOwnedByCurrentUser: function() {
            return $q(function(resolve) {
                socketService.socket.emit('game:usergmlist', {
                    'gmID': userService.getCurrentUserID()
                }, function(games) {
                    resolve(games);
                });
            });
        },

        getVariant: function(variantName) {
            // Strip spaces.
            variantName = variantName.replace(' ', '');
            return $http.get('variants/' + variantName + '/' + variantName + '.json');
        },

        getVariantSVG: function(variantName) {
            // Strip spaces.
            variantName = variantName.replace(' ', '');
            return $http.get('variants/' + variantName + '/' + variantName + '.svg');
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
                    resolve(seasons[0]);
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
                    resolve(seasons[0]);
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

        /**
         * Updates orders for a single unit.
         * @param  {String} action  The action.
         * @param  {Object} command The unit's new command.
         * @param  {Object} season  The season being modified.
         */
        publishCommand: function(action, command, season) {
            socketService.socket.emit('season:setorder', {
                seasonID: season._id,
                command: command,
                action: action
            });
        },

        setReadyState: function(game, state) {
            socketService.socket.emit('season:toggleready', {
                gameID: game._id,
                isReady: state,
                playerID: userService.getCurrentUserID()
            });
        },

        getPowerOfCurrentUserInGame: function(game) {
            for (var p = 0; p < game.players.length; p++) {
                if (game.players[p].player_id === userService.getCurrentUserID())
                    return game.players[p].power;
            }

            return null;
        },

        getUnitOwnerInRegion: function(r, type, power) {
            var subregionWithUnit = _.find(r.sr, 'unit');

            if (r.unit && unitMatchesFilters(r.unit, type, power))
                return r;
            else if (subregionWithUnit && unitMatchesFilters(subregionWithUnit.unit, type, power))
                return subregionWithUnit;

            return null;
        }
    };

    function unitMatchesFilters(unit, type, power) {
        return (!type || unit.type === type) && (!power || unit.power === power);
    }
}]);
