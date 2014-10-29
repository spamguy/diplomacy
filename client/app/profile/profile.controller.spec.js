'use strict';

describe('Controller: ProfileCtrl', function () {

  // load the controller's module
  beforeEach(module('profile'));

  var ProfileController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileController = $controller('ProfileController', {
      $scope: scope
    });

    scope.$digest();
  }));

  it('defines two tabs', function () {
    expect(scope.tabs).toBeDefined();

    expect(scope.tabs.length).toEqual(2);
  });
});
