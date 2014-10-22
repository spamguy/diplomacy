'use strict';

angular.module('diplomacy')
  .config(function ($stateProvider) {
    $stateProvider
      .state('games.view', {
			url: '/:id',
			controller: 'ViewCtrl',
			templateUrl: 'app/games/view/view.html'
		});
  });