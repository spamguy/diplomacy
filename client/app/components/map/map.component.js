angular.module('map.component', ['gameService'])
.component('sgMap', {
    bindings: {
        variant: '<',
        svg: '=',
        game: '=',
        season: '=',
        readonly: '<',
        header: '<'
    },
    controller: 'MapController',
    templateUrl: 'app/components/map/map.tmpl.html'
});
