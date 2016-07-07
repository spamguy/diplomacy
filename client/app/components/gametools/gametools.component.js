angular.module('gametools.component', ['userService', 'gameService'])
.component('sgGameTools', {
    templateUrl: 'app/components/gametools/gametools.tmpl.html',
    bindings: {
        game: '=',
        phaseIndex: '=',
        powers: '<'
    },
    controller: 'GameToolsController'
});
