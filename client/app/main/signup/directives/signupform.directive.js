'use strict';

angular.module('signupform.directives', ['diplomacy'])
	.directive('sgValidUsername', function($http, userService) {
		var waitTimer;

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attrs, ctrl) {
				/*
				 * Attach event to username field:
				 * If it looks like user is done typing (blur/keyup), wait one second before querying DB.
				 */
				element.on('blur keyup', function(e) {
					if (e.target.value) {
						clearInterval(waitTimer);
						waitTimer = setTimeout(function() {
							userService.checkIfUserExists(e.target.value, function(data) {
								ctrl.$setValidity('unique', !data.exists);
							});
						}, 1000);
					}
				});
			}
		};
	});
	
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