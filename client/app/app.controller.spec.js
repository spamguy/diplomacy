'use strict';

describe('AppController', function () {
	var AppController, scope, httpBackend;

	beforeEach(module('diplomacy'));

	beforeEach(inject(function ($controller, $rootScope) {
		scope = $rootScope.$new();
		AppController = $controller('AppController', {
			$scope: scope
		});

		scope.$digest();
	}));

	it('is null when not logged in', function() {
		expect(scope.currentUser).toBeNull();
	});
});
