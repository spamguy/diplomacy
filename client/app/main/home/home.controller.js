'use strict';

angular.module('diplomacy.main')
    .controller('HomeController', function ($scope, gameService) {
        $scope.readonly = true;
        $scope.arrows = false;
        $scope.variant = gameService.getVariant('standard');
        $scope.gamedata = gameService.getRandomStandardGame();
    });
