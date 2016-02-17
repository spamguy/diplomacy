angular.module('gamelistitem.directive', ['ngMaterial'])
.directive('sgGameListItem', ['gameService', '$mdDialog', '$mdMedia', '$state', function(gameService, $mdDialog, $mdMedia, $state) {
    'use strict';

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

            scope.reasonForNoJoin = function() {
                // Breaking this down into individual rules to avoid one monstrous if() statement.

                // User doesn't have enough points.
                if (scope.game.minimumScoreToJoin > scope.user.points)
                    return 'You need a minimum of Đ' + scope.game.minimumScoreToJoin + ' to join.';

                // User belongs to game already, whether as GM or user.
                if (_.find(scope.game.players, _.matchesProperty('player_id', scope.user._id)))
                    return 'You already are a player in this game.';
                if (scope.game.gm_id === scope.user._id)
                    return 'You GM this game.';

                return null;
            };

            scope.goToGame = function() {
                // Don't warp to games if you don't already belong.
                if (!scope.joinable)
                    $state.go('games.view', { id: scope.game._id });
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

            scope.showMapDialog = function($event) {
                var useFullScreen = $mdMedia('sm') || $mdMedia('xs');

                gameService.getMoveDataForCurrentUser(scope.game._id).then(function(season) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        fullscreen: useFullScreen,
                        templateUrl: 'app/directives/gamelistitem/gamelistitemmap.tmpl.html',
                        controller: 'GameListItemMapController',
                        clickOutsideToClose: true,
                        locals: {
                            season: season,
                            variant: scope.variant
                        }
                    });
                });
            };

            gameService.getMoveDataForCurrentUser(scope.game._id).then(function(season) {
                if (season) {
                    var timeUntilDeadline = new Date(season.deadline).getTime() - new Date().getTime();
                    scope.seasonDescription = season.season + ' ' + season.year;
                    scope.readableTimer = humanizeDuration(timeUntilDeadline, { largest: 2, round: true });
                }
                else {
                    scope.seasonDescription = '(not started)';
                    scope.readableTimer = humanizeDuration(scope.game.moveClock * 60 * 60 * 1000) + ' deadline';
                }
            });
        }
    };
}])
.controller('GameListItemMapController', ['$scope', '$mdDialog', 'gameService', function($scope, $mdDialog, gameService) {

}]);
