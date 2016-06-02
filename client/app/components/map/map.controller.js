angular.module('map.component')
.controller('MapController', ['$scope', 'gameService', 'mapService', function($scope, gameService, MapService) {
    var vm = this,
        normalisedVariantName = gameService.getNormalisedVariantName(vm.variant.name),
        paths = vm.svg.getElementsByTagName('path'),
        provinceReferenceDictionary = _.indexBy(this.variant.provinces, 'r'),
        p,
        i,
        province,
        unitInProvince,
        target,
        moveLayer = d3.select('svg g.moveLayer'),
        moveLayerArrows = moveLayer.selectAll('path'),
        moveLayerHolds = moveLayer.selectAll('circle'),
        evenMorePadding,
        unitRadius = 8,
        unitRadiusPlusPadding = unitRadius + 6,
        pathLength,
        midpoint,
        force,
        links = [],
        holds = [];

    vm.paths = { };
    vm.service = new MapService(this.variant, this.game, this.phase);
    vm.getFormattedDeadline = gameService.getFormattedDeadline;

    vm.onOrderSave = function(response, r, action, source, target) {
        if (response.status === 'ok') {
            $scope.$parent.updateProvinceData(r, action, source, target);

            renderForceDirectedGraph();
        }
    };

    // Fill out province paths only if the phase is active.
    if (!vm.readonly) {
        for (p = 0; p < paths.length; p++)
            vm.paths[paths[p].id.toUpperCase()] = paths[p].getAttribute('d');
    }

    vm.imagePath = 'variants/' + normalisedVariantName + '/' + normalisedVariantName + '.png';
    vm.viewBox = '0 0 ' + getSVGAttribute('width') + ' ' + getSVGAttribute('height');

    if (!this.phase)
        return;

    vm.clickCount = 0;

    force = d3.layout.force()
        .nodes(provinceReferenceDictionary)
        .links(links)
        .on('tick', onForceDirectedGraphTick.bind(this)); // bind() forces function's scope to controller.

    renderForceDirectedGraph();

    function onForceDirectedGraphTick(e, scope) {
        var provinces = vm.phase.provinces;
        moveLayerArrows.attr('d', function(d) {
            /*
             * Let T -> target, T' -> target of target, and S -> source.
             *
             * The endpoint of this path depends on a) what S intends to do, and b) what T intends to do.
             * If S intends to complement T, and if T' exists, the endpoint should exist somewhere on the T - T' path to indicate the support.
             * In all other cases T as an endpoint is fine.
             */

            var sourceProvince = _.find(provinces, 'r', d.source.r),
                targetProvince = _.find(provinces, 'r', d.target.r),
                unitInSourceProvince = gameService.getUnitOwnerInProvince(sourceProvince),
                unitInTargetProvince = gameService.getUnitOwnerInProvince(targetProvince),
                sourceCoordinates = vm.service.getCoordinatesForUnitInProvince(sourceProvince, unitInSourceProvince.unit.type),
                targetCoordinates = vm.service.getCoordinatesForUnitInProvince(targetProvince, unitInSourceProvince.unit.type),
                sx = sourceCoordinates.x,
                sy = sourceCoordinates.y,
                tx = targetCoordinates.x,
                ty = targetCoordinates.y,
                dx,
                dy,
                action = d.target.action,
                actionOfTarget,
                pathOfTarget,
                dr;

            // Tweak coordinates of arrows that interact with other arrows.
            if (action === 'move') {
                // Move arrows should appear to run head-to-tail as closely as possible.
                if (sx > tx)
                    tx += 20;
                else
                    tx -= 20;
            }
            else if (unitInTargetProvince && unitInTargetProvince.unit.order) {
                actionOfTarget = unitInTargetProvince.unit.order.action;

                if (action !== 'support') {
                    evenMorePadding = -2;

                    // Figure out a good corner to which to point.
                    if (sx > tx)
                        tx += unitRadiusPlusPadding + evenMorePadding;
                    else
                        tx -= unitRadiusPlusPadding + evenMorePadding;

                    if (sy > ty)
                        ty += unitRadiusPlusPadding + evenMorePadding;
                    else
                        ty -= unitRadiusPlusPadding + evenMorePadding;
                }
            }

            dx = tx - sx;
            dy = ty - sy;

            // Use generic arc for moves and units supporting holding targets.
            if ((!actionOfTarget && action === 'support') || action === 'move') {
                dr = Math.sqrt(dx * dx + dy * dy);
                return 'M' + sx + ',' + sy + 'A' + dr + ',' + dr + ' 0 0,1 ' + tx + ',' + ty;
            }
            // Use straight line for units supporting moving targets.
            else if (moveLayerArrows && actionOfTarget === 'move') {
                pathOfTarget = d3.selectAll('g.moveLayer path#' + d.target.r + '-link').node();
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
        holds = _.filter(vm.phase.provinces, function(r) {
            if (r.unit && r.unit.order) {
                if (r.unit.order.action === 'hold')
                    return true;
                else
                    return false;
            }
        });

        for (p = 0; p < vm.phase.provinces.length; p++) {
            province = vm.phase.provinces[p];
            unitInProvince = gameService.getUnitOwnerInProvince(province);

            if (unitInProvince && unitInProvince.unit.order && unitInProvince.unit.order.action !== 'hold')
                target = unitInProvince.unit.order.source || unitInProvince.unit.order.target || unitInProvince.r;
            else
                continue;

            links.push({
                source: _.defaults(province, { fixed: true }),
                target: _.defaults(provinceReferenceDictionary[target.split('/')[0]], {
                    fixed: true, // To keep d3 from treating this map like a true force graph.
                    action: unitInProvince.unit.order.action,
                    failed: unitInProvince.unit.order.failed
                })
            });
        }

        moveLayerArrows = moveLayerArrows.data(links);
        moveLayerArrows.enter()
            .insert('svg:path')
            .attr('marker-end', vm.service.generateMarkerEnd)
            .attr('class', function(d) {
                var failed = d.target.failed ? 'failed ' : 'ok ';
                return failed + 'link move';
            })
            .attr('id', function(d) { return d.source.r + '-link'; });
        moveLayerArrows.exit().remove();

        // Append circles to units perceived to or actually holding.
        moveLayerHolds = moveLayerHolds.data(holds);
        moveLayerHolds.enter()
            .insert('svg:circle')
            .attr('id', function(d) { return d.r + '-hold'; })
            .attr('class', 'hold')
            .attr('cx', function(d) { return provinceReferenceDictionary[d.r].x; })
            .attr('cy', function(d) { return provinceReferenceDictionary[d.r].y; })
            .attr('r', unitRadiusPlusPadding);
        moveLayerHolds.exit().remove();

        force.start();
        for (i = 20; i > 0; --i) force.tick();
        force.stop();
    }

    function getSVGAttribute(attr) {
        return vm.svg.documentElement.getAttribute(attr);
    }
}]);
