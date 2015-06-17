'use strict';

angular.module('diplomacy.main')
    .controller('SignupController', ['$scope', '$http', 'loginService', function ($scope, $http, loginService) {
        // TODO: force logged-in users out of this page

        angular.extend($scope, {
            user: {
                username: null,
                password: null,
                password2: null,
                email: null,
                points: 0,
                timezone: 0,
                save: function() {
                    $http.post('/api/users', this).then(loginService.validLoginCallback);
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
