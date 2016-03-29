angular.module('map.component')
.controller('MapController', ['$location', 'gameService', function($location, gameService) {
    var vm = this,
        paths = vm.svg.getElementsByTagName('path'),
        regionReferenceDictionary = _.indexBy(this.variant.regions, 'r'),
        p;

    vm.getSVGAttribute = getSVGAttribute;
    vm.isHeaderVisible = isHeaderVisible;
    vm.inputCommand = inputCommand;
    vm.getSCTransform = getSCTransform;
    vm.getSCFill = getSCFill;
    vm.changeAction = changeAction;
    vm.onOrderSave = onOrderSave;

    // Bail if vital info isn't present.
    // TODO: Log and report absence of variant info.
    if (!this.variant || !this.svg)
        return;

    vm.regionReferenceDictionary = regionReferenceDictionary;
    vm.paths = { };
    for (p = 0; p < paths.length; p++)
        vm.paths[paths[p].id.toUpperCase()] = paths[p].getAttribute('d');

    vm.imagePath = 'variants/' + this.variant.name + '/' + this.variant.name + '.png';
    vm.viewBox = '0 0 ' + vm.getSVGAttribute('width') + ' ' + vm.getSVGAttribute('height');

    if (this.season) {
        vm.canMove = _.contains(this.season.season.toLowerCase(), 'move');
        vm.canRetreat = _.contains(this.season.season.toLowerCase(), 'retreat');
        vm.canBuild = _.contains(this.season.season.toLowerCase(), 'adjust');
        vm.scPath = $location.absUrl() + '#sc';
        vm.commandData = [];
        vm.currentAction = 'hold';
        vm.clickCount = 0;
    }

    function getSVGAttribute(attr) {
        return this.svg.documentElement.getAttribute(attr);
    }

    function isHeaderVisible() {
        return this.header && this.season;
    }

    function getSCTransform(r) {
        return 'translate(' +
            regionReferenceDictionary[r.toUpperCase()].x + ',' +
            regionReferenceDictionary[r.toUpperCase()].y + ') ' +
            'scale(0.04)';
    }

    function getSCFill(r) {
        var owner = _.find(vm.season.regions, 'r', r).sc;
        return owner ? vm.variant.powers[owner].colour : '#bbbbbb';
    }

    function inputCommand(id) {
        var r = id.toUpperCase(),
            region = _.find(vm.season.regions, 'r', r),
            ownerInRegion = gameService.getUnitOwnerInRegion(region),
            unitInRegion;

        if (ownerInRegion)
            unitInRegion = ownerInRegion.unit;

        // Users who try to control units that don't exist or don't own?
        // We have ways of shutting the whole thing down.
        if (vm.commandData.length === 0 &&
            (!unitInRegion || unitInRegion.power !== gameService.getPowerOfCurrentUserInGame(vm.game)))
            return;

        vm.commandData.push(r);

        switch (vm.currentAction) {
        case 'hold':
            // Don't bother retaining clicks or such. Just continue on to send the command.
            break;
        case 'move':
            // Source, target.
            if (vm.commandData.length < 2)
                return;
            break;
        case 'support':
            // Source, target, target of target.
            if (vm.commandData.length < 3)
                return;
            break;
        case 'convoy':
            break;
        }

        // Making it this far means there is a full set of commands to publish.
        gameService.publishCommand(vm.currentAction, vm.commandData, vm.season,
            function(response) {
                vm.onOrderSave(response, _.find(vm.season.regions, 'r', vm.commandData[0]), vm.currentAction, vm.commandData[1], vm.commandData[2]);
                vm.commandData = [];
            }
        );
    }

    function changeAction(action) {
        vm.currentAction = action;

        // Reset any half-made orders.
        vm.commandData = [];
    }

    function onOrderSave(response, r, action, y1, y2) {
        if (response.status === 'ok') {
            var unitInRegion = gameService.getUnitOwnerInRegion(r);

            // Update local data to reflect DB change.
            unitInRegion.order = { action: action };
            if (y1)
                unitInRegion.order.y1 = y1;
            if (y2)
                unitInRegion.order.y2 = y2;
        }
    }
}]);
