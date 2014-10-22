'use strict';

describe('SignupForm directives', function () {	
	var form,		// el to which directive is applied
		$scope,
		$httpBackend, // $http mock
		usernameExistsHandler;
		
	beforeEach(function() {
		module('signupform.directives');
	});
	
	beforeEach(function() {
		inject(function ($injector, $rootScope, $compile, $q, $timeout) {
			$scope = $rootScope;
			$httpBackend = $injector.get('$httpBackend');
			usernameExistsHandler = $httpBackend.whenGET(/\/publicapi\/users\/.+?\/exists/);
            var el = angular.element('<form name="form"><input type="text" name="username" ng-model="user.username" sg-username-is-valid /></form>');
			
            $scope.user = { username: null };
            $compile(el)($scope);
			form = $scope.form;
		});
	});
	
	afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
   
   it('should invalidate with existing usernames', function() {
	    form.username.$setViewValue('username_in_use');
	   
		$scope.$digest();
		
		expect($scope.user.username).toEqual('username_in_use');
//		
//		usernameExistsHandler.respond('200', { exists: true });
//		$httpBackend.expectGET('/publicapi/users/' + $scope.user.username + '/exists/');
//		$httpBackend.flush();
//		
//		expect(form.username.$valid).toBe(false);
   });
		
//	beforeEach(module('signupform.directives'));
//	beforeEach(inject(function ($rootScope) {
//		scope = $rootScope.$new();
//	}));
//	
//	function compileDirective(dir, tpl) {
//		if (!tpl) tpl = '<form name="testForm"><input type="text" ng-model="testModel" value="x" ' + dir + ' /></form>';
//		
//		inject(function($compile) {
//			var form = $compile(tpl)(scope);
//			el = form.find('input');
//		});
//		
//		scope.$digest();
//	}
//	// PART I: USERNAME
//	it('should not allow empty usernames', function() {
//		scope.x = '';
//		compileDirective('sg-valid-username');
//		
//		expect(scope.testForm.$valid).toBeFalsy();
//	});
});