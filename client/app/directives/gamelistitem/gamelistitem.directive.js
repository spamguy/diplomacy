angular.module('gamelistitem.directive', ['ngMaterial'])
.directive('sgGameListItem', ['gameService', '$mdDialog', '$mdMedia', '$state', function(gameService, $mdDialog, $mdMedia, $state) {
    'use strict';

    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/directives/gamelistitem/gamelistitem.tmpl.html',
        scope: {
            game: '=game',
            joinable: '=joinable',
            user: '=user'
        },
        link: function(scope, element, attrs) {
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

            scope.showJoinDialog = function(event) {
                var confirm = $mdDialog.confirm()
                                .title('Really join?')
                                .textContent('Are you sure you want to join this game? By clicking OK you are agreeing to participate to the best of your ability. See the FAQ and Community Guidelines for details.')
                                .ariaLabel('Really join game?')
                                .targetEvent(event)
                                .ok('Join')
                                .cancel('Cancel');

                $mdDialog.show(confirm).then(function() {
                    gameService.joinGame(scope.game, { }, function() {
                        $state.go('profile.games');
                    });
                });
            };

            scope.showMapDialog = function($event) {
                var useFullScreen = $mdMedia('sm') || $mdMedia('xs');

                gameService.getMoveDataForCurrentUser(scope.game._id).then(function(season) {
                    gameService.getVariant(scope.game.variant).then(function(variant) {
                        gameService.getVariantSVG(scope.game.variant).then(function(svg) {
                            $mdDialog.show({
                                parent: angular.element(document.body),
                                targetEvent: $event,
                                fullscreen: useFullScreen,
                                templateUrl: 'app/directives/gamelistitem/gamelistitemmap.tmpl.html',
                                controller: 'GameListItemMapController',
                                clickOutsideToClose: true,
                                locals: {
                                    season: season,
                                    variant: variant,
                                    game: scope.game,
                                    svg: svg
                                }
                            });
                        });
                    });
                });
            };

            gameService.getMoveDataForCurrentUser(scope.game._id).then(function(season) {
                switch (scope.game.status) {
                case 0:
                    scope.seasonDescription = '(waiting on ' + (scope.game.maxPlayers - scope.game.players.length) + ' more players)';
                    scope.readableTimer = humanizeDuration(scope.game.moveClock * 60 * 60 * 1000) + ' deadline';
                    break;
                case 1:
                    var timeUntilDeadline = new Date(season.deadline).getTime() - new Date().getTime();
                    scope.seasonDescription = season.season + ' ' + season.year;
                    scope.readableTimer = humanizeDuration(timeUntilDeadline, { largest: 2, round: true });
                    break;
                case 2:
                    scope.seasonDescription = 'Complete';
                    scope.readableTimer = 'Complete';
                    break;
                }
            });
        }
    };
}])
.controller('GameListItemMapController', ['$scope', '$mdDialog', 'season', 'variant', 'game', 'svg', function($scope, $mdDialog, season, variant, game, svg) {
    $scope.season = season;
    $scope.variant = variant;
    $scope.game = game;
    $scope.svg = new DOMParser().parseFromString(svg.data, 'image/svg+xml');
}]);
