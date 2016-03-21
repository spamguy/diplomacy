angular.module('map.component')
.controller('MapController', ['$location', function($location) {
    var vm = this,
        paths = vm.svg.getElementsByTagName('path'),
        regionReferenceDictionary = _.indexBy(this.variant.regions, 'r'),
        p;

    // Bail if vital info isn't present.
    // TODO: Log and report absence of variant info.
    if (!this.variant || !this.svg)
        return;

    vm.getSVGAttribute = getSVGAttribute;
    vm.isHeaderVisible = isHeaderVisible;
    vm.inputCommand = inputCommand;
    vm.getSCTransform = getSCTransform;
    vm.changeAction = changeAction;

    vm.paths = { };
    for (p = 0; p < paths.length; p++)
        vm.paths[paths[p].id.toUpperCase()] = paths[p].getAttribute('d');

    vm.imagePath = 'variants/' + this.variant.name + '/' + this.variant.name + '.png';

    if (this.season) {
        vm.canMove = _.contains(this.season.season.toLowerCase(), 'move');
        vm.canRetreat = _.contains(this.season.season.toLowerCase(), 'retreat');
        vm.canBuild = _.contains(this.season.season.toLowerCase(), 'adjust');
        vm.viewBox = '0 0 ' + vm.getSVGAttribute('width') + ' ' + vm.getSVGAttribute('height');
        vm.scPath = $location.absUrl() + '#sc';
        vm.currentAction = 'hold';
    }

    function getSVGAttribute(attr) {
        return this.svg.documentElement.getAttribute(attr);
    }

    function isHeaderVisible() {
        return this.header && this.season;
    }

    function getSCTransform(r) {
        return 'translate(' + regionReferenceDictionary[r.toUpperCase()].x + ',' + regionReferenceDictionary[r.toUpperCase()].y + ')';
    }

    function inputCommand(r) {

    }

    function changeAction(action) {
        vm.currentAction = action;

        // Reset any half-made orders.
        vm.commandData = [];
    }
}]);
