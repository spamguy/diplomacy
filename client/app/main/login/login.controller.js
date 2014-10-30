'use strict';

angular.module('diplomacy')
	.controller('LoginController', function ($scope, $http, $window, $state) {
		angular.extend($scope, {
			user: {
				username: null,
				password: null,
				
				login: function() {
					$http.post('/auth/login', this)
						.success(function(data, status) {
							$window.sessionStorage.token = data.token;

							$scope.setCurrentUser(data.id);

							// redirect to profile
							$state.go('profile');
						})
						.error(function(data, status) {
							// clear token
							delete $window.sessionStorage.token;

							// TODO: handle errors
						});
				}
			}
		});
		
		$scope.login = function() {
			$scope.user.login();
		};
  });
