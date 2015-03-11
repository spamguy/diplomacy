'use strict';

angular.module('games')
.controller('NewGameController', ['$scope', 'gameService', function ($scope, gameService) {
    angular.extend($scope, {
        game: {
            name: null,
            variant: null
        }
    });

    $scope.canExitStep1 = function() {
        return $scope.newGameForm.name.$valid;
    };

    $scope.onWizardFinished = function() {
        gameService.createNewGame($scope.game);
    };
}]);
