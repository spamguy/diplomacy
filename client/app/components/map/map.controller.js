angular.module('map.component')
.controller('MapController', ['$scope', '$state', 'gameService', 'mapService', '$mdBottomSheet', function($scope, $state, gameService, MapService, $mdBottomSheet) {
    var vm = this,
        phase = this.game.phases ? this.game.phases[this.phaseIndex] : null,
        normalisedVariantName = gameService.getNormalisedVariantName(vm.game.variant),
        paths = vm.svg.getElementsByTagName('path'),
        p,
        i,
        moveLayer = d3.select('svg g.moveLayer'),
        moveLayerArrows = moveLayer.selectAll('path'),
        moveLayerHolds = moveLayer.selectAll('circle'),
        force,
        links = [],
        holds = [],
        unitRadiusPlusPadding = 16;

    vm.paths = { };
    vm.service = new MapService(this.game, this.phaseIndex);
    vm.getFormattedDeadline = gameService.getFormattedDeadline;
    vm.goToIndex = goToIndex;

    vm.onOrderSave = function(response, r, action, source, target) {
        if (response.status === 'ok') {
            $scope.$parent.updateProvinceData(r, action, source, target);

            renderForceDirectedGraph();
        }
    };

    vm.showOrderSheet = function() {
        $mdBottomSheet.show({
            templateUrl: 'app/components/map/ordersheet/ordersheet.tmpl.html',
            controller: 'OrderSheetController',
            controllerAs: 'vm',
            clickOutsideToClose: true,
            locals: {
                service: vm.service
            }
        }).then(vm.service.setCurrentAction);
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
                action = d.target.action,
                actionOfTarget = targetProvince.unit ? targetProvince.unit.action : null;

            switch (action) {
            case 'move':
                return vm.service.generateArc(sx, sy, tx, ty);
            case 'support':
                if (actionOfTarget === 'move' || actionOfTarget === 'convoy')
                    return vm.service.generateBisectingLine(d.source.p, d.target.p, sx, sy);
                else
                    return vm.service.generateArc(sx, sy, tx, ty);
            case 'convoy':
                return vm.service.generateLine(sx, sy, tx, ty);
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
                target = province.unit.target;
                links.push({
                    source: _.defaults(province, { fixed: true }),
                    target: _.assignIn({ }, phase.provinces[target], {
                        fixed: true, // To keep d3 from treating this map like a true force graph.
                        action: province.unit.action,
                        failed: province.unit.failed
                    })
                });
            }

            // Convoys get an extra link to express, um, conveyance.
            if (province.unit.action === 'convoy') {
                links.push({
                    source: _.defaults(province, { fixed: true }),
                    target: _.assignIn({ }, phase.provinces[province.unit.targetOfTarget], {
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
            .attr('marker-start', vm.service.generateMarkerStart)
            .attr('marker-end', vm.service.generateMarkerEnd)
            .attr('class', function(d) {
                var failed = d.target.failed ? 'failed ' : 'ok ';
                return failed + 'link ' + d.target.action;
            })
            .attr('id', function(d) { return d.source.p + '-' + d.target.p + '-link'; });
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

    function goToIndex(index) {
        // Keep phase index inside countable number of phases.
        if (index > vm.game.phases.length)
            index = vm.game.phases.length;
        else if (index <= 0)
            index = null;

        $state.go('.', {
            id: vm.game.id,
            phaseIndex: index
        }, { reload: true });
    }
}]);
