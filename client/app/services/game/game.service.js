/* global moment */
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

        getNormalisedVariantName: function(variantName) {
            return variantName.replace(new RegExp(' ', 'g'), '').toLowerCase();
        },

        getVariant: function(variantName) {
            variantName = this.getNormalisedVariantName(variantName);
            return $http.get('variants/' + variantName + '/' + variantName + '.json');
        },

        getVariantSVG: function(variantName) {
            variantName = this.getNormalisedVariantName(variantName);
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
            var options = gameID ? { gameID: gameID } : { };

            // Year and season must both be provided to be valid.
            if (year && season) {
                options.year = year;
                options.season = season;
            }

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
         * @param {Function} [callback] The callback to execute after completion.
         */
        joinGame: function(game, options, callback) {
            options = options || { };
            options.gameID = game._id;
            socketService.socket.emit('game:join', options, callback);
        },

        /**
         * Updates orders for a single unit.
         * @param  {String} action  The action.
         * @param  {Object} command The unit's new command.
         * @param  {Object} season  The season being modified.
         * @param  {Function} callback The callback to execute after completion.
         */
        publishCommand: function(action, command, season, callback) {
            socketService.socket.emit('season:setorder', {
                seasonID: season._id,
                command: command,
                action: action
            }, callback);
        },

        setReadyState: function(game, state) {
            socketService.socket.emit('season:toggleready', {
                gameID: game._id,
                isReady: state
            });
        },

        adjudicateSeason: function(season) {
            socketService.socket.emit('season:adjudicate', {
                seasonID: season._id,
                gameID: season.game_id
            });
        },

        /**
         * Ends a game and awards no wins.
         * @param  {Object} game The game.
         */
        endGame: function(game) {
            socketService.socket.emit('game:end', {
                gameID: game._id
            });
        },

        /**
         * Removes a player from a game.
         * @param  {String}   playerID The player ID.
         * @param  {Object}   game     The game.
         * @param  {Boolean}  punish   Whether to penalise the player.
         * @param  {Function} callback A callback function.
         */
        removePlayer: function(playerID, game, punish, callback) {
            socketService.socket.emit('game:leave', {
                gameID: game._id,
                playerID: playerID,
                punish: punish
            }, callback);
        },

        getPowerOfCurrentUserInGame: function(game) {
            for (var p = 0; p < game.players.length; p++) {
                if (game.players[p].player_id === userService.getCurrentUserID())
                    return game.players[p].power;
            }

            return null;
        },

        /**
         * Gets a unit's most precise location within a region.
         * @param  {Object} r     The region.
         * @param  {Integer} [type] The unit type by which to filter.
         * @param  {String} [power] The power by which to filter.
         * @return {Object}       The region or subregion with a unit present, or null.
         */
        getUnitOwnerInRegion: function(r, type, power) {
            var subregionWithUnit = _.find(r.sr, 'unit');

            if (r.unit && unitMatchesFilters(r.unit, type, power))
                return r;
            else if (subregionWithUnit && unitMatchesFilters(subregionWithUnit.unit, type, power))
                return subregionWithUnit;

            return null;
        },

        isGM: function(game) {
            return game.gm_id === userService.getCurrentUserID();
        },

        isPlayer: function(game) {
            return this.getPowerOfCurrentUserInGame(game) !== null;
        },

        isParticipant: function(game) {
            return this.isGM(game) || this.isPlayer(game);
        },

        getFormattedDeadline: function(season) {
            return moment(season.deadline).valueOf();
        }
    };

    function unitMatchesFilters(unit, type, power) {
        return (!type || unit.type === type) && (!power || unit.power === power);
    }
}]);
