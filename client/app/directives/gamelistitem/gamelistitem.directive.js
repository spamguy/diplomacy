angular.module('gamelistitem.directive', ['ngMaterial'])
.directive('sgGameListItem', ['$mdDialog', '$state', function($mdDialog, $state) {
    'use strict';

    var renderClockDescription = function(clock) {
            return 'Every ' + humanizeDuration(clock * 60 * 1000);
        },
        renderCalendarDescription = function() {
            return '';
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

            scope.toggleGameDetails = function(id) {
                scope.expandState = !scope.expandState;
            };

            scope.reasonForNoJoin = function() {
                // Breaking this down into individual rules to avoid one monstrous if() statement.

                // User doesn't have enough points.
                if (scope.game.minimumScoreToJoin > scope.user.points)
                    return 'You need a minimum of Đ' + scope.game.minimumScoreToJoin + ' to join.';

                // User belongs to game already, whether as GM or user.
                if (_.find(scope.game.players, _.matchesProperty('player_id', scope.user._id)))
                    return 'You already participate in this game.';

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

            scope.movementDescription = scope.game.movementClock ? renderClockDescription(scope.game.movementClock) : renderCalendarDescription();
        }
    };
}]);
