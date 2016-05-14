angular.module('map.component', ['mapService', 'timer'])
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
    // controller: ['$scope', 'mapService', function($scope, MapService) {
    //     var vm = this;
    //     vm.service = new MapService(this.variant, this.game, this.season);
    // }],
    templateUrl: 'app/components/map/map.tmpl.html'
});
