'use strict';

angular.module('diplomacy')
	.controller('LoginController', function ($scope, $http) {
		angular.extend($scope, {
			user: {
				username: null,
				password: null,
				
				login: function() {
					$http.post('/auth/login', this);
				}
			}
		});
		
		$scope.login = function() {
			$scope.user.login();
		};
  });
