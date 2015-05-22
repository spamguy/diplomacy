angular.module('gamelistitem.directive', ['ngMaterial'])
.directive('sgGameListItem', ['$mdDialog', '$state', function($mdDialog, $state) {
    'use strict';

    var renderClockDescription = function(clock) {
        return 'Every ' + humanizeDuration(clock * 60 * 1000);
    };

    var renderCalendarDescription = function() {
        return '';
    };

    var getResolutionStatusMessage = function(playersForFullGame, foundPlayers) {
        if (playersForFullGame > foundPlayers) {
            var neededPlayers = playersForFullGame - foundPlayers,
                personPlural = neededPlayers === 1 ? '' : 's';
            return 'Waiting on ' + neededPlayers + ' player' + personPlural;
        }
        else {
            return 'Next deadline in ';
        }
    };

    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/directives/gamelistitem/gamelistitem.tmpl.html',
        scope: {
            variantPromise: '=variant',
            game: '=game',
            joinable: '=joinable',
            user: '=user'
        },
        link: function(scope, element, attrs) {
            scope.variants = { };
            scope.expandState = false;

            scope.toggleGameDetails = function(id) {
                scope.expandState = !scope.expandState;
            };

            scope.canJoinGame = function() {
                // breaking this down into individual rules to avoid one monstrous if() statement

                // user doesn't have enough points
                if (scope.game.minimumScoreToJoin > scope.user.points)
                    return false;

                // user belongs to game already, whether as GM or user
                if (_.find(scope.game.players, _.matchesProperty('player_id', scope.user._id)))
                    return false;

                return true;
            };

            scope.goToGame = function() {
                // don't warp to games if you don't already belong
                if (!scope.joinable)
                    $state.go('games.view', { id: scope.game._id });
            };

            scope.getJoinLabel = function() {
                return scope.canJoinGame() ? 'Join this game' : 'Can\'t join :(';
            };

            scope.getStatusMessage = function(variant) {
                var playersForFullGame = _.keys(variant.powers).length,
                    foundPlayers = scope.game.playerCount;

                // if listing isn't meant to offer join option, render status
                if (scope.joinable) {
                    if (scope.canJoinGame()) {
                        return getResolutionStatusMessage(playersForFullGame, foundPlayers);
                    }
                    else {
                        return 'Can\'t join this game';
                    }
                }
                else {
                    return getResolutionStatusMessage(playersForFullGame, foundPlayers);
                }
            };

            scope.showJoinDialog = function($event) {
                $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'app/directives/gamelistitem/joindialog.tmpl.html',
                    controller: 'JoinDialogController',
                    locals: {
                        game: scope.game
                    }
                });
            };

            scope.movementDescription = scope.game.movementClock ? renderClockDescription(scope.game.movementClock) : renderCalendarDescription();

            scope.$watch('variantPromise', function(variantPromise) {
                if (variantPromise) {
                    variantPromise.then(function(variant) {
                        variant = variant.data;

                        scope.statusMessage = scope.getStatusMessage(variant);
                    });
                }
            });
        }
    };
}]);
