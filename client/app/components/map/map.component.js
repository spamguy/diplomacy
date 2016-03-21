function MapController() {
    var vm = this,
        paths = vm.svg.getElementsByTagName('path'),
        p;

    // Bail if vital info isn't present.
    // TODO: Log and report absence of variant info.
    if (!this.variant || !this.svg)
        return;

    vm.getSVGAttribute = getSVGAttribute;
    vm.isHeaderVisible = isHeaderVisible;
    vm.inputCommand = inputCommand;

    vm.paths = { };
    for (p = 0; p < paths.length; p++)
        vm.paths[paths[p].id.toUpperCase()] = paths[p].getAttribute('d');

    vm.imagePath = 'variants/' + this.variant.name + '/' + this.variant.name + '.png';

    if (this.season) {
        vm.canMove = _.contains(this.season.season.toLowerCase(), 'move');
        vm.canRetreat = _.contains(this.season.season.toLowerCase(), 'retreat');
        vm.canBuild = _.contains(this.season.season.toLowerCase(), 'adjust');
        vm.viewBox = '0 0 ' + vm.getSVGAttribute('width') + ' ' + vm.getSVGAttribute('height');
        vm.currentAction = 'hold';
    }

    function getSVGAttribute(attr) {
        return this.svg.documentElement.getAttribute(attr);
    }

    function isHeaderVisible() {
        return this.header && this.season;
    }

    function inputCommand(r) {

    }
}

angular.module('map.component', ['SVGService', 'gameService'])
.component('sgMap', {
    bindings: {
        variant: '<',
        svg: '=',
        season: '=',
        readonly: '<',
        header: '<'
    },
    controller: MapController,
    templateUrl: 'app/components/map/map.tmpl.html'
});
