angular.module('games')
.controller('JoinDialogController', ['$scope', 'game', '$mdDialog', 'gameService', '$state', function($scope, game, $mdDialog, gameService, $state) {
    'use strict';

    $scope.closeDialog = function() {
        $mdDialog.hide();
    };

    $scope.joinGame = function() {
        gameService.joinGame(game);
        $mdDialog.hide();
        $state.go('profile.games');
    };
}]);
