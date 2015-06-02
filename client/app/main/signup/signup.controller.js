'use strict';

angular.module('diplomacy.main')
    .controller('SignupController', ['$scope', '$http', '$state', function ($scope, $http, $state) {
        angular.extend($scope, {
            user: {
                username: null,
                password: null,
                password2: null,
                email: null,
                points: 0,
                timezone: 0,
                save: function() {
                    $http.post('/api/users', this).then(function() { $state.go('profile'); });
                }
            }
        });

        $scope.canExitUsernameStep = function() {
            return $scope.signupForm.username.$valid;
        };

        $scope.canExitPasswordStep = function() {
            return $scope.signupForm.password.$valid &&
                $scope.signupForm.password2.$valid;
        };

        $scope.onWizardFinished = function() {
            $scope.user.save();
        };
    }]);
