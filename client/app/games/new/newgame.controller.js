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

    $scope.getCurrentScore = function() {
        return userService.getCurrentUser().points;
    };

    $scope.hasDecentScore = function() {
        return $scope.getCurrentScore() >= $scope.minimumPointsToGM;
    };

    $scope.canExitStep1 = function() {
        return $scope.newGameForm.name.$valid;
    };

    $scope.onWizardFinished = function() {
        gameService.createNewGame($scope.game);
    };
}]);
