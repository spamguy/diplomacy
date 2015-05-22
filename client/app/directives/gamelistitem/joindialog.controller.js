angular.module('games')
.controller('JoinDialogController', ['$scope', 'game', '$mdDialog', 'gameService', function($scope, game, $mdDialog, gameService) {
    'use strict';

    $scope.closeDialog = function() {
        $mdDialog.hide();
    };

    $scope.joinGame = function() {
        gameService.joinGame(game);
    };
}]);
