'use strict';

angular.module('games')
  .config(function ($stateProvider) {
    $stateProvider
      .state('games.view', {
            url: '/:id',
            controller: 'ViewCtrl',
            templateUrl: 'app/games/view/view.html'
        });
  });
