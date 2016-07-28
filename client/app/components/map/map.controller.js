angular.module('map.component')
.controller('MapController', ['$scope', 'gameService', 'mapService', function($scope, gameService, MapService) {
    var vm = this,
        phase = this.game.phases ? this.game.phases[this.phaseIndex] : null,
        normalisedVariantName = gameService.getNormalisedVariantName(vm.game.variant),
        paths = vm.svg.getElementsByTagName('path'),
        p,
        i,
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
    vm.service = new MapService(this.game, this.phaseIndex);
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

    if (!phase)
        return;

    vm.clickCount = 0;
    vm.provinceArray = _.values(phase.provinces);

    force = d3.layout.force()
        .nodes(vm.game)
        .links(links)
        .on('tick', onForceDirectedGraphTick.bind(this)); // bind() forces function's scope to controller.

    renderForceDirectedGraph();

    function onForceDirectedGraphTick(e, scope) {
        moveLayerArrows.attr('d', function(d) {
            /*
             * Let T -> target, T' -> target of target, and S -> source.
             *
             * The endpoint of this path depends on a) what S intends to do, and b) what T intends to do.
             * If S intends to complement T, and if T' exists, the endpoint should exist somewhere on the T - T' path to indicate the support.
             * In all other cases T as an endpoint is fine.
             */

            var sourceProvince = phase.provinces[d.source.p],
                targetProvince = phase.provinces[d.target.p],
                sx = sourceProvince.unitLocation.x,
                sy = sourceProvince.unitLocation.y,
                tx = targetProvince.unitLocation.x,
                ty = targetProvince.unitLocation.y,
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
            else if (targetProvince.unit && targetProvince.unit.targetOfTarget) {
                actionOfTarget = targetProvince.unit.action;

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
        var target,
            province;

        // Reset link list and regenerate holding unit list.
        links = [];
        holds = [];

        for (p in phase.provinces) {
            province = phase.provinces[p];

            // Nothing to render for provinces without units or units without orders.
            if (!province.unit || !province.unit.action)
                continue;

            if (province.unit.action === 'hold') {
                holds.push(province);
            }
            else {
                target = province.unit.source || province.unit.target;
                links.push({
                    source: _.defaults(province, { fixed: true }),
                    target: _.defaults(phase.provinces[target], {
                        fixed: true, // To keep d3 from treating this map like a true force graph.
                        action: province.unit.action,
                        failed: province.unit.failed
                    })
                });
            }
        }

        moveLayerArrows = moveLayerArrows.data(links);
        moveLayerArrows.enter()
            .insert('svg:path')
            .attr('marker-end', vm.service.generateMarkerEnd)
            .attr('class', function(d) {
                var failed = d.target.failed ? 'failed ' : 'ok ';
                return failed + 'link move';
            })
            .attr('id', function(d) { return d.source.p + '-link'; });
        moveLayerArrows.exit().remove();

        // Append circles to units perceived to or actually holding.
        moveLayerHolds = moveLayerHolds.data(holds);
        moveLayerHolds.enter()
            .insert('svg:circle')
            .attr('id', function(d) { return d.p + '-hold'; })
            .attr('class', 'hold')
            .attr('cx', function(d) { return phase.provinces[d.p].unitLocation.x; })
            .attr('cy', function(d) { return phase.provinces[d.p].unitLocation.y; })
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
