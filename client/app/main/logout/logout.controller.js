'use strict';

angular.module('diplomacy.main')
.controller('LogoutController', ['userService', '$state', function(userService, $state) {
    userService.unsetToken();
    $state.go('main.home');
}]);
