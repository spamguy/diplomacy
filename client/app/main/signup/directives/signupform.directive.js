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