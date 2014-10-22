'use strict';

describe('LoginController', function () {

  // load the controller's module
  beforeEach(module('diplomacy'));

  var LoginController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LoginController = $controller('LoginController', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
