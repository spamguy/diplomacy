'use strict';

describe('SignupForm directives', function () {	
	var $timeout,
		scope,
		userService,
		el;
		
	beforeEach(function() {
		module('signupform.directives');
	});
	
	beforeEach(function() {
		inject(function ($injector, $rootScope, $compile, $q, _$timeout_) {
			$timeout = _$timeout_;
			scope = $rootScope.$new();
            el = $compile('<input id="username" type="text" name="username" ng-model="user.username" sg-valid-username />')(scope);
			
			userService = $injector.get('userService');
            scope.user = { username: 'test_username' };
			spyOn(userService, 'checkIfUserExists').and.returnValue({ exists: true });
		});
	});
   
   it('Fires on blur', function() {
		// set value of <input> to trigger the username check
	    el.val(scope.user.username);
		// build blur event and fire it
		el.triggerHandler('blur');
		$timeout.flush();
		
		expect(userService.checkIfUserExists).toHaveBeenCalled();
   });
   
	it('Fires on arbitrary keyup', function() {
	    var keyArray = [65, 49, 90, 189]; // a, 1, z, -
		
		for (var i = 0; i < keyArray.length; i++) {
			// set value of <input> to trigger the username check
			el.val(scope.user.username);
			// build blur event and fire it
			el.triggerHandler('keyup', keyArray[i]);
			$timeout.flush();

			expect(userService.checkIfUserExists).toHaveBeenCalled();
		}
	});
	
	xit('Invalidates form on existing username', function() {
		// set value of <input> to trigger the username check
	    el.val(scope.user.username);
		// build blur event and fire it
		el.triggerHandler('blur');
		$timeout.flush();
		scope.$digest();
		
		expect(el.username.$valid).toBe(false);
	});
});