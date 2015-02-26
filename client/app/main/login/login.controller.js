'use strict';

angular.module('diplomacy.main')
    .controller('LoginController', ['$scope', '$http', '$window', '$state', 'userService', function ($scope, $http, $window, $state, userService) {
        angular.extend($scope, {
            user: {
                username: null,
                password: null,

                login: function() {
                    $http.post('/auth/login', this)
                        .success(function(data, status) {
                            userService.setCurrentUser(data.id);
                            userService.setToken(data.token);
                            userService.setRefreshToken(data.refreshtoken);

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
  }]);
