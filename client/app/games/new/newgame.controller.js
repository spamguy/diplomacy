'use strict';

angular.module('games')
.controller('NewGameController', ['$scope', 'gameService', 'userService', function ($scope, gameService, userService) {
    angular.extend($scope, {
        game: {
            name: null,
            variant: null
        }
    });

    $scope.minimumPointsToGM = 10;

    userService.getUser(userService.getCurrentUser())
        .then(function(user) {
            $scope.points = user.points;
        });

    $scope.hasDecentScore = function() {
        return $scope.points >= $scope.minimumPointsToGM;
    };

    $scope.canExitStep1 = function() {
        return $scope.newGameForm.name.$valid;
    };

    $scope.onWizardFinished = function() {
        gameService.createNewGame($scope.game);
    };
}]);
