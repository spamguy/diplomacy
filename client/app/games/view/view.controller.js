'use strict';

angular.module('games')
.controller('ViewController', ['$scope', 'gameService', 'variant', 'game', 'season', function($scope, gameService, variant, game, season) {
    $scope.variant = variant;
    $scope.game = game;
    $scope.season = season;
}]);
