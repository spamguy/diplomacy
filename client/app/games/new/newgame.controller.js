'use strict';

angular.module('games')
.controller('NewGameController', ['$scope', 'gameService', 'userService', '$state', 'variants', function($scope, gameService, userService, $state, variants) {
    angular.extend($scope, {
        game: {
            name: null,
            description: null,
            year: null,
            season: null,
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
            gmID: userService.getCurrentUser()._id,

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

    $scope.minimumPointsToGM = 0;
    $scope.currentPoints = currentUser.points;
    $scope.hasDecentScore = function() {
        return currentUser.points >= $scope.minimumPointsToGM;
    };
}]);
