'use strict';

describe('userService', function () {
	var $scope,
		$httpBackend, // $http mock
		usernameExistsHandler,
		userService;
		
	beforeEach(module('userService'));
	
	beforeEach(function() {
		inject(function ($injector, $rootScope, $compile, $q, $timeout) {
			$scope = $rootScope;
			$httpBackend = $injector.get('$httpBackend');
			$httpBackend.whenGET(/\/publicapi\/users\/.+?\/exists/).respond({ exists: true });
			userService = $injector.get('userService');
		});
	});
	
	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
   });
   
   it('should return JSON with the property "exists"', function() {
	    userService.checkIfUserExists('sample_username', function(data) {
		    expect(data.exists).toBeDefined();
	    });
		$httpBackend.flush();
   });
});