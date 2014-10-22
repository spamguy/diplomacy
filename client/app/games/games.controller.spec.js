'use strict';

describe('Controller: GamesController', function () {

  // load the controller's module
  beforeEach(module('diplomacy'));

  var GamesController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GamesController = $controller('GamesController', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
