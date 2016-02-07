'use strict';

angular.module('games')
.controller('ViewController', ['$scope', 'userService', 'gameService', 'variant', 'game', 'season', function($scope, userService, gameService, variant, game, season) {
    $scope.variant = variant;
    $scope.game = game;
    $scope.season = season;
    $scope.readonly = userService.getCurrentUser() === game.gm_id;
}]);
