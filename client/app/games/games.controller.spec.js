'use strict';

describe('GameListController', function () {

  // load the controller's module
  beforeEach(module('games'));

  var GamesController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GamesController = $controller('GamesController', {
      $scope: scope
    });
  }));
});
