'use strict';

angular.module('games')
.controller('NewGameController', ['$scope', 'gameService', 'userService', '$state', 'currentUser', 'variants', function($scope, gameService, userService, $state, currentUser, variants) {
    angular.extend($scope, {
        game: {
            name: null,
            variant: 'Standard',
            move: {
                clock: 24
            },
            retreat: {
                clock: 24
            },
            adjust: {
                clock: 24
            },
            visibility: 'public',
            press: 'white',
            minimumScoreToJoin: 0,
            playerID: currentUser._id,

            save: function() {
                gameService.getVariant($scope.game.variant).then(function(variant) {
                    $scope.game.maxPlayers = _.keys(variant.data.powers).length;
                    gameService.createNewGame($scope.game);
                    $state.go('profile.games');
                });
            }
        }
    });

    $scope.variants = variants;

    $scope.minimumPointsToGM = 10;
    $scope.currentPoints = currentUser.points;
    $scope.hasDecentScore = function() {
        return currentUser.points >= $scope.minimumPointsToGM;
    };

    // $scope.humaniseTime = function(clock) {
    //     // hours -> milliseconds
    //     return humanizeDuration(moment.duration({ hours: clock }).asMilliseconds());
    // };
}]);
