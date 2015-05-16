angular.module('games')
.controller('JoinDialogController', ['$scope', '$mdDialog', function($scope, $mdDialog) {
    'use strict';

    $scope.closeDialog = function() {
        $mdDialog.hide();
    };
}]);
