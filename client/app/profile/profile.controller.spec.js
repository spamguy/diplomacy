'use strict';

describe('Controller: ProfileCtrl', function () {

  // load the controller's module
  beforeEach(module('profile'));

  var ProfileCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileCtrl = $controller('ProfileController', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
