angular.module('map.component', ['gameService'])
.component('sgMap', {
    bindings: {
        variant: '<',
        svg: '=',
        season: '=',
        readonly: '<',
        header: '<'
    },
    controller: 'MapController',
    templateUrl: 'app/components/map/map.tmpl.html'
});
