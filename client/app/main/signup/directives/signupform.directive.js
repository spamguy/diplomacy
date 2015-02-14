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
             *
             * TODO: Decouple service from directive.
             */
            var promise;
            element.on('blur keyup', function(e) {
                $timeout.cancel(promise);
                if (e.target.value) {
                    promise = $timeout(function() {
                        userService.userExists(e.target.value).then(function(data) {
                            ctrl.$setValidity('unique', !data.exists);
                        });
                    }, 1000);
                }
            });
        }
    };
}])
.directive('sgCompareTo', [function() {
    return {
        scope: {
            otherModelValue: '=sgCompareTo'
        },
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
}]);
