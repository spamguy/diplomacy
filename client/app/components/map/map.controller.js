angular.module('map.component')
.controller('MapController', ['$location', '$scope', 'gameService', function($location, $scope, gameService) {
    var vm = this,
        paths = vm.svg.getElementsByTagName('path'),
        regionReferenceDictionary = _.indexBy(this.variant.regions, 'r'),
        p,
        i,
        region,
        unitInRegion,
        target,
        moveLayer = d3.select('svg g.moveLayer'),
        moveLayerArrows = moveLayer.selectAll('path'),
        moveLayerHolds = moveLayer.selectAll('circle'),
        evenMorePadding,
        unitRadius = 10,
        unitRadiusPlusPadding = unitRadius + 6,
        pathLength,
        midpoint,
        force,
        links = [],
        holds = [];

    vm.getSVGAttribute = getSVGAttribute;
    vm.isHeaderVisible = isHeaderVisible;
    vm.inputCommand = inputCommand;
    vm.getSCTransform = getSCTransform;
    vm.getSCFill = getSCFill;
    vm.getUnitFill = getUnitFill;
    vm.getCoordinates = getCoordinates;
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

    if (!this.season)
        return;

    vm.canMove = _.contains(this.season.season.toLowerCase(), 'move');
    vm.canRetreat = _.contains(this.season.season.toLowerCase(), 'retreat');
    vm.canBuild = _.contains(this.season.season.toLowerCase(), 'adjust');
    vm.scPath = $location.absUrl() + '#sc';
    vm.commandData = [];
    vm.currentAction = 'hold';
    vm.clickCount = 0;

    force = d3.layout.force()
        .nodes(regionReferenceDictionary)
        .links(links)
        .on('tick', onForceDirectedGraphTick.bind(this)); // bind() forces function's scope to controller.

    renderForceDirectedGraph();

    function getSVGAttribute(attr) {
        return this.svg.documentElement.getAttribute(attr);
    }

    function isHeaderVisible() {
        return this.header && this.season;
    }

    function getSCTransform(r) {
        return 'translate(' +
            regionReferenceDictionary[r.toUpperCase()].sc.x + ',' +
            regionReferenceDictionary[r.toUpperCase()].sc.y + ') ' +
            'scale(0.04)';
    }

    function getSCFill(r) {
        var owner = _.find(vm.season.regions, 'r', r).sc;
        return owner ? vm.variant.powers[owner].colour : '#bbbbbb';
    }

    function getUnitFill(r) {
        var container = gameService.getUnitOwnerInRegion(r);
        return this.variant.powers[container.unit.power].colour;
    }

    function getCoordinates(r, type) {
        var subregionWithUnit = _.find(r.sr, { unit: { type: type } });

        if (r.unit) {
            return { x: regionReferenceDictionary[r.r].x, y: regionReferenceDictionary[r.r].y };
        }
        else if (subregionWithUnit) {
            subregionWithUnit = _.find(regionReferenceDictionary[r.r].sr, 'r', subregionWithUnit.r);
            return { x: subregionWithUnit.x, y: subregionWithUnit.y };
        }

        return { x: null, y: null };
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
                vm.onOrderSave(response, vm.commandData[0], vm.currentAction, vm.commandData[1], vm.commandData[2]);
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
            $scope.$parent.updateRegionData(r, action, y1, y2);

            renderForceDirectedGraph();
        }
    }

    function generateMarkerEnd(d) {
        // See CSS file for why separate markers exist for failed orders.
        var failed = d.target.failed ? 'failed' : '';
        return 'url(' + $location.absUrl() + '#' + failed + d.target.action + ')';
    }

    function onForceDirectedGraphTick(e, scope) {
        var regions = vm.season.regions,
            svg = vm.svg;
        moveLayerArrows.attr('d', function(d) {
            /*
             * Let T -> target, T' -> target of target, and S -> source.
             *
             * The endpoint of this path depends on a) what S intends to do, and b) what T intends to do.
             * If S intends to complement T, and if T' exists, the endpoint should exist somewhere on the T - T' path to indicate the support.
             * In all other cases T as an endpoint is fine.
             */

            var sx = regionReferenceDictionary[d.source.r].x,
                sy = regionReferenceDictionary[d.source.r].y,
                tx = regionReferenceDictionary[d.target.r].x,
                ty = regionReferenceDictionary[d.target.r].y,
                dx,
                dy,
                action = d.target.action,
                actionOfTarget,
                pathOfTarget,
                dr,
                targetUnit;

            // If a hold, don't draw any arrows.
            if (d.target.r === d.source.r)
                return;

            targetUnit = _.find(regions, 'r', d.target.r);
            if (targetUnit.unit && targetUnit.unit.order) {
                actionOfTarget = targetUnit.unit.order.action;

                if (action === 'move')
                    evenMorePadding = 5;
                else
                    evenMorePadding = 0;

                // Figure out a good corner to which to point.
                if (sx > tx)
                    tx += unitRadiusPlusPadding + evenMorePadding;
                else
                    tx -= unitRadiusPlusPadding + evenMorePadding;

                if (sy > ty)
                    ty -= unitRadiusPlusPadding + evenMorePadding;
                else
                    ty += unitRadiusPlusPadding + evenMorePadding;
            }

            dx = tx - sx;
            dy = ty - sy;

            if (action !== 'support' || actionOfTarget !== 'move') {
                dr = Math.sqrt(dx * dx + dy * dy);
                return 'M' + sx + ',' + sy + 'A' + dr + ',' + dr + ' 0 0,1 ' + tx + ',' + ty;
            }
            else if (actionOfTarget === 'move') {
                pathOfTarget = svg.select('path#' + d.target.r)[0][0];
                pathLength = pathOfTarget.getTotalLength();
                midpoint = pathOfTarget.getPointAtLength(pathLength / 2);

                return 'M' + sx + ',' + sy + 'L' + midpoint.x + ',' + midpoint.y;
            }
        });
    }

    /**
     * Builds force directed graph.
     */
    function renderForceDirectedGraph() {
        // Reset link list and regenerate holding unit list.
        links = [];
        holds = _.filter(vm.season.regions, function(r) {
            if (r.unit && r.unit.order) {
                if (r.unit.order.action === 'hold')
                    return true;
                else if (r.unit.order.action === 'support' && !r.unit.order.y2)
                    return true;
                else
                    return false;
            }
        });

        for (p = 0; p < vm.season.regions.length; p++) {
            region = vm.season.regions[p];
            unitInRegion = gameService.getUnitOwnerInRegion(region);

            if (unitInRegion && unitInRegion.unit.order && unitInRegion.unit.order.action !== 'hold')
                target = unitInRegion.unit.order.y1 || unitInRegion.unit.order.y2 || unitInRegion.r;
            else
                continue;

            links.push({
                source: _.defaults(region, { fixed: true }),
                target: _.defaults(regionReferenceDictionary[target], {
                    fixed: true, // To keep d3 from treating this map like a true force graph.
                    action: unitInRegion.unit.order.action,
                    failed: unitInRegion.unit.order.failed
                })
            });
        }

        moveLayerArrows = moveLayerArrows.data(links);
        moveLayerArrows.enter()
            .insert('svg:path')
            .attr('marker-end', generateMarkerEnd)
            .attr('class', function(d) {
                var failed = d.target.failed ? 'failed ' : 'ok ';
                return failed + 'link move';
            })
            .attr('id', function(d) { return d.source.r + '-' + d.target.r + '-link'; });
        moveLayerArrows.exit().remove();

        // Append circles to units perceived to or actually holding.
        moveLayerHolds = moveLayerHolds.data(holds);
        moveLayerHolds.enter()
            .insert('svg:circle')
            .attr('class', 'hold')
            .attr('cx', function(d) { return regionReferenceDictionary[d.r].x; })
            .attr('cy', function(d) { return regionReferenceDictionary[d.r].y; })
            .attr('r', unitRadiusPlusPadding);
        moveLayerHolds.exit().remove();

        force.start();
        for (i = 20; i > 0; --i) force.tick();
        force.stop();
    }
}]);
