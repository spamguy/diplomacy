'use strict';

angular.module('signupform.directives', ['userService'])
	.directive('sgValidUsername', ['$timeout', 'userService', function($timeout, userService) {
		var waitTimer;

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attrs, ctrl) {
				/*
				 * Attach event to username field:
				 * If it looks like user is done typing (blur/keyup), wait one second before querying DB.
				 */
				var promise;
				element.on('blur keyup', function(e) {$timeout.cancel(promise);
					if (e.target.value) {
						$timeout.cancel(promise);
						promise = $timeout(function() {
							userService.checkIfUserExists(e.target.value, function(data) {
								ctrl.$setValidity('unique', !data.exists);
							});
						}, 1000);
					}
				});
			}
		};
	}]);
	
//	.directive('sgValidPassword', function() {
//		return {
//			restrict: 'A',
//			require: 'ngModel',
//			link: function(scope, element, attrs, ctrl) {
//				element.on('blur', function(e) {
//					if (e.target.value.trim() === '') {
//						ctrl.$setValidity('whitespace', false);
//					}
//					else {
//						ctrl.$setValidity('whitespace', true);
//						
//						if (e.target.value.length < 5)
//							ctrl.$setValidity('length', false);
//					}
//				});
//			}
//		};
//	})
//	
//	.directive('sgPasswordMatch', function() {
//		return {
//			restrict: 'A',
//			require: 'ngModel',
//			link: function(scope, element, attrs, ctrl) {
//				element.on('blur', function(e) {
//					ctrl.$setValidity('mismatch', false);//e.target.value === $('#password1').val());
//				});
//			}
//		};
//	});