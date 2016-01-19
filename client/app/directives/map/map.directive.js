angular.module('map.directive', ['SVGService', 'gameService'])
.directive('sgMap', ['$location', '$compile', 'SVGService', 'gameService', function($location, $compile, SVGService, gameService) {
    'use strict';

    var unitRadius = 10,
        unitRadiusPlusPadding = unitRadius + 6,
        evenMorePadding,
        defs,
        scGroup,
        unitGroup,
        regionDictionary = {},
        links = [],
        absURL = '',
        force,
        moveGroup,
        mouseLayer,
        region,
        target,
        pathLength,
        midpoint,
        generateMarkerEnd = function(d) {
            // See CSS file for why separate markers exist for failed orders.
            var failed = d.target.failed ? 'failed' : '';
            return 'url(' + absURL + '#' + failed + d.target.action + ')';
        },
        markerDefs = [
            { name: 'move', path: 'M0,-5L10,0L0,5', viewbox: '0 -5 10 10' },
            { name: 'support', path: 'M 0,0m -5,0a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0', viewbox: '-6 -6 12 12' }
        ],
        s;

    return {
        replace: true,
        scope: {
            variant: '=variant',               // Full variant data. (JSON)
            season: '=season',                 // Movement data. (JSON)
            header: '=header',                 // Whether to show the header. (bool)
            readonly: '=readonly',             // Whether to allow user interaction. (bool)
            arrows: '=arrows'                  // Whether to show movement arrows -- true implies season is defined. (bool)
        },
        restrict: 'E',
        controllerAs: 'mapController',
        controller: ['$scope', function($scope) {
            this.changeAction = function(action) {
                $scope.currentAction = action;

                // Reset any half-made orders.
                $scope.commandData = { };
            };
        }],
        link: function(scope, element, attrs) {
            // Set default action.
            scope.currentAction = 'hold';
            scope.commandData = { };

            // Set click counter, responsible for deciding in accordance with $scope.currentAction when to publish an order.
            scope.clickCount = 0;

            // Add header?
            if (scope.header && !scope.readonly && scope.season) {
                $compile('<sg-map-header></sg-map-header>')(scope, function(cloned, scope) {
                    element.append(cloned);
                });
            }

            // Bail if vital info isn't present.
            // TODO: Log and report absence of variant info.
            if (!scope.variant)
                return;

            absURL = $location.absUrl();

            var season = scope.season,
                variant = scope.variant,
                readonly = scope.readonly;

            d3.xml('variants/' + variant.name + '/' + variant.name + '.svg', 'image/svg+xml', function(xml) {
                if (!xml)
                    return;

                regionDictionary = _.indexBy(variant.regions, 'r');

                // STEP 1: Build root <svg>. ------------------
                var svg = d3.select(element[0])
                    .append('svg')
                    .attr('viewBox', '0 0 ' + xml.rootElement.getAttribute('width') + ' ' + xml.rootElement.getAttribute('height'));
                // --------------------------------------------

                // STEP 2: Build templated items. -------------
                defs = svg.append('svg:defs');

                // Create curved arrow template.
                defs.selectAll('marker')
                    .data(markerDefs)      // mapping movement types to CSS classes
                    .enter()
                    .append('svg:marker')
                    .attr('id', function(d) { return d.name; })
                    .attr('viewBox', function(d) { return d.viewbox; })
                    .attr('markerWidth', 6)
                    .attr('markerHeight', 6)
                    .attr('orient', 'auto')
                    .attr('class', function(d) {
                        return _.startsWith(d, 'failed') ? 'failed' : 'ok';
                    })
                    .append('svg:path')
                    .attr('d', function(d) { return d.path; });

                // Create supply centre template.
                SVGService.getStar(function(star) {
                    defs.append(function() { return star; })
                        .attr('id', 'sc');
                });
                // --------------------------------------------

                // STEP 3: Add background image layer. --------
                svg.append('g')
                    .append('svg:image')
                    .attr('xlink:href', 'variants/' + variant.name + '/' + variant.name + '.png')
                    .attr('width', '100%')
                    .attr('height', '100%');

                // If there is no season data (e.g., the game hasn't started yet), stop here.
                if (!season)
                    return;
                // --------------------------------------------

                // STEP 4: Add clickable region layer. ---------
                mouseLayer = svg.append(function() {
                    return xml.documentElement.firstElementChild;
                })
                .selectAll('path');

                // Add events to clickable layer if readonly disabled AND season is unprocessed.
                // FIXME: Check for processed state.
                if (!readonly) {
                    mouseLayer.on('click', function() {
                        scope.commandData.push(this.id);

                        switch (scope.currentAction) {
                        case 'hold':
                            // Don't bother retaining clicks or such. Just continue on to send the command.
                            break;
                        case 'move':
                            // Source, target.
                            if (scope.commandData.length < 2)
                                return;
                            break;
                        case 'support':
                            // Source, target, target of target.
                            if (scope.commandData.length < 3)
                                return;
                            break;
                        case 'convoy':
                            break;
                        }

                        // Making it this far means there is a full set of commands to publish.
                        gameService.publishCommand(scope.commandData, season);
                    });
                }
                // --------------------------------------------

                // STEP 5: Apply supply centre (SC) dot layer.
                scGroup = svg.append('g')
                    .attr('id', 'scGroup')
                    .selectAll('path')
                    .data(_.filter(season.regions, function(r) { return !_.isUndefined(r.sc); }))
                    .enter();

                // Append one pretty coloured star per SC.
                scGroup.append('use')
                    .attr('xlink:href', absURL + '#sc')
                    .attr('class', 'sc')
                    .attr('transform', function(d) {
                        return 'translate(' + regionDictionary[d.r].sc.x + ',' + regionDictionary[d.r].sc.y + ') scale(0.03)';
                    })
                    .attr('fill', function(d) {
                        return d.sc ? variant.powers[d.sc].colour : '#bbbbbb';
                    });
                // --------------------------------------------

                // STEP 6: Apply unit marker layer. -----------
                unitGroup = svg.append('g')
                    .attr('id', 'unitGroup');

                // FIXME: Consider and render bounced units in a region.
                unitGroup
                    .selectAll('circle')
                    .data(_.filter(season.regions, function(r) { return r.unit && r.unit.type === 1; }))
                    .enter()
                    .append('circle')
                    .attr('cx', function(d) { return regionDictionary[d.r].x; })
                    .attr('cy', function(d) { return regionDictionary[d.r].y; })
                    .attr('r', unitRadius)
                    .attr('stroke-width', '1px')
                    .attr('stroke', '#000')
                    .attr('fill', function(d) {
                        return variant.powers[d.unit.power].colour;
                    });

                // FIXME: Consider and render bounced units in a region.
                unitGroup
                    .selectAll('rect')
                    .data(_.filter(season.regions, function(r) {
                        return r.unit && r.unit.type === 2;
                    }))
                    .enter()
                    .append('rect')
                    .attr('x', function(d) {
                        return regionDictionary[d.r].x - 10;
                    })
                    .attr('y', function(d) {
                        return regionDictionary[d.r].y - 5;
                    })
                    .attr('height', 10)
                    .attr('width', unitRadius * 2)
                    .attr('stroke-width', '1px')
                    .attr('stroke', '#000')
                    .attr('fill', function(d) {
                        return variant.powers[d.unit.power].colour;
                    });
                // --------------------------------------------

                for (s = 0; s < season.regions.length; s++) {
                    region = season.regions[s];
                    if (region.unit && region.unit.order && region.unit.order.action) {
                        target = region.unit.order.y1 || region.unit.order.y2;

                        if (target) {
                            links.push({
                                source: _.defaults(region, { fixed: true }),
                                target: _.defaults(regionDictionary[target], {
                                    fixed: true, // to keep d3 from treating this map like a true force graph
                                    action: region.unit.order.action,
                                    failed: region.unit.order.failed
                                })
                            });
                        }
                    }
                }

                if (links.length > 0) {
                    force = d3.layout.force()
                        .nodes(regionDictionary)
                        .links(links)
                        .on('tick', function() {
                            moveGroup.attr('d', function(d) {
                                /*
                                 * Let T -> target, T' -> target of target, and S -> source.
                                 *
                                 * The endpoint of this path depends on a) what S intends to do, and b) what T intends to do.
                                 * If S intends to complement T, and if T' exists, the endpoint should exist somewhere on the T - T' path to indicate the support.
                                 * In all other cases T as an endpoint is fine.
                                 */

                                var sx = regionDictionary[d.source.r].x,
                                    sy = regionDictionary[d.source.r].y,
                                    tx = regionDictionary[d.target.r].x,
                                    ty = regionDictionary[d.target.r].y,
                                    dx,
                                    dy,
                                    action = d.target.action,
                                    actionOfTarget,
                                    pathOfTarget,
                                    dr;

                                if (d.target) {
                                    var targetUnit = _.find(season.regions, 'r', d.target.r);
                                    if (targetUnit.unit && targetUnit.unit.order)
                                        actionOfTarget = targetUnit.unit.order.action;
                                }

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
                        });
                    moveGroup = svg.append('g')
                        .attr('id', 'moveGroup')
                        .selectAll('path')
                        .data(force.links())
                        .enter()
                        .append('svg:path')
                        .attr('marker-end', generateMarkerEnd)
                        .attr('class', function(d) {
                            var failed = d.target.failed ? 'failed ' : 'ok ';
                            return failed + 'link move';
                        })
                        .attr('id', function(d) { return d.source.r; });

                    // Append circles to units perceived to or actually holding.
                    moveGroup
                        .select('circle')
                        .data(_.filter(season.regions, function(r) {
                            if (r.unit && r.unit.order) {
                                if (r.unit.order.action === 'hold')
                                    return true;
                                else if (r.unit.order.action === 'support' && !r.unit.order.y2)
                                    return true;
                                else
                                    return false;
                            }
                        }))
                        .enter()
                        .append('circle')
                        .attr('class', 'hold')
                        .attr('cx', function(d) { return regionDictionary[d.r].x; })
                        .attr('cy', function(d) { return regionDictionary[d.r].y; })
                        .attr('r', unitRadiusPlusPadding);

                    force.start();
                    for (var i = 20; i > 0; --i) force.tick();
                    force.stop();
                }
            });
        }
    };
}]);
