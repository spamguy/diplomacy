'use strict';

angular.module('diplomacy.main')
	.controller('SignupController', ['$scope', '$http', function ($scope, $http) {
		angular.extend($scope, {
			user: {
				username: null,
				password: null,
				password2: null,
				email: null,
				save: function() {
					$http.put('/auth/new', this);
				}
			}
		});
		
		$scope.processForm = function() {
			$scope.user.save();
		};
	}]);
