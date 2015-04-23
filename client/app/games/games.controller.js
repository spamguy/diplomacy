'use strict';

angular.module('games')
.controller('GameListController', ['$scope', 'gameService', function ($scope, gameService) {
    $scope.games = gameService.getAllOpenGames();
    $scope.variants = gameService.getAllVariantNames();
}]);
