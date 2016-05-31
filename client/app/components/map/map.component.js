angular.module('map.component', ['mapService', 'timer'])
.component('sgMap', {
    bindings: {
        variant: '<',
        svg: '=',
        game: '=',
        phase: '=',
        readonly: '<',
        header: '<'
    },
    controller: 'MapController',
    // controller: ['$scope', 'mapService', function($scope, MapService) {
    //     var vm = this;
    //     vm.service = new MapService(this.variant, this.game, this.phase);
    // }],
    templateUrl: 'app/components/map/map.tmpl.html'
});
