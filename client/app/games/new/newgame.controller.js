'use strict';

angular.module('games')
.controller('NewGameController', ['$scope', 'gameService', 'userService', 'variants', function ($scope, gameService, userService, variants) {
    $scope.forms = {
        newGameForm: { }
    };

    angular.extend($scope, {
        game: {
            name: null,
            variant: 'Standard',
            movement: {
                type: 'clock',
                clock: 24
            },
            retreat: {
                type: 'clock',
                clock: 24
            },
            adjust: {
                type: 'clock',
                clock: 24
            },
            visibility: 'public',
            press: 'white',
            minimumScoreToJoin: 0,
            playerID: userService.getCurrentUser()
        }
    });

    $scope.variants = variants;

    $scope.minimumPointsToGM = 10;

    userService.getUser(userService.getCurrentUser())
        .then(function(user) {
            $scope.points = user.points;
        });

    $scope.hasDecentScore = function() {
        return $scope.points >= $scope.minimumPointsToGM;
    };

    $scope.canExitStep1 = function() {
        return $scope.forms.newGameForm.gamename.$valid;
    };

    $scope.onWizardFinished = function() {
        // apply variant data DB will need occasionally, like max player count
        gameService.getVariant($scope.game.variant)
        .then(function(variant) {
            $scope.game.maxPlayers = variant.data.powers.length;
            gameService.createNewGame($scope.game);
        });
    };

    $scope.humaniseTime = function(clock) {
        // hours -> minutes -> seconds -> milliseconds
        return humanizeDuration(clock * 60 * 60 * 1000);
    };
}]);
