'use strict';

angular.module('games')
  .config(function ($stateProvider) {
    $stateProvider
      .state('games.view', {
            url: '/:id',
            controller: 'ViewController',
            templateUrl: 'app/games/view/view.html'
        });
  });
