'use strict';

angular.module('diplomacy')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.login', {
            url: '/login',
            templateUrl: 'app/main/login/login.html',
            controller: 'LoginController'
        });
  });
