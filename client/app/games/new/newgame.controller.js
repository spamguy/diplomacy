'use strict';

angular.module('games')
.controller('NewGameController', ['$scope', 'gameService', 'userService', 'variants', '$state', function ($scope, gameService, userService, variants, $state) {
    $scope.forms = {
        newGameForm: { }
    };

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
            $state.go('profile');
        });
    };

    $scope.humaniseTime = function(clock) {
        // hours -> milliseconds
        return humanizeDuration(moment.duration({ hours: clock }).asMilliseconds());
    };
}]);
