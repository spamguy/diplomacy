'use strict';

angular.module('diplomacy.main')
    .controller('SignupController', ['$scope', '$http', '$state', function ($scope, $http, $state) {
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

        $scope.getNextState = function() {
            switch ($state.current.name) {
                case 'main.signup.username':
                    $state.go('main.signup.password');
                    break;
                case 'main.signup.password':
                    $state.go('main.signup.email');
                    break;
            };
        };

        $scope.getPrevState = function() {
            switch ($state.current.name) {
                case 'main.signup.email':
                    $state.go('main.signup.password');
                    break;
                case 'main.signup.password':
                    $state.go('main.signup.username');
                    break;
            };
        };
    }]);
