angular.module('map.component', ['mapService', 'timer'])
.component('sgMap', {
    bindings: {
        svg: '=',
        game: '=',
        phaseIndex: '=',
        readonly: '<',
        header: '<'
    },
    controller: 'MapController',
    templateUrl: 'app/components/map/map.tmpl.html'
});
