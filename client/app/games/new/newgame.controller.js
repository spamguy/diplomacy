'use strict';

angular.module('games')
.controller('NewGameController', ['$scope', 'gameService', 'userService', '$state', 'variants', function($scope, gameService, userService, $state, variants) {
    angular.extend($scope, {
        game: {
            name: null,
            description: null,
            year: null,
            phase: null,
            variant: 'Standard',
            move: {
                days: 1,
                hours: 0,
                minutes: 0
            },
            retreat: {
                days: 1,
                hours: 0,
                minutes: 0
            },
            adjust: {
                days: 1,
                hours: 0,
                minutes: 0
            },
            visibility: 'public',
            press: 'white',
            minimumScoreToJoin: 0,
            gmID: $scope.currentUser.id,

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

    $scope.minimumDedicationToGM = 0;
    $scope.dedication = (($scope.currentUser.actionCount - $scope.currentUser.failedActionCount) / $scope.currentUser.actionCount) * 100;
    $scope.hasDecentScore = function() {
        return $scope.dedication >= $scope.minimumDedicationToGM;
    };
}]);
