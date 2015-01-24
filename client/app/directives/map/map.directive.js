angular.module('map.directives', ['d3', 'SVGService'])
.directive('sgMap', ['d3Service', '$location', 'SVGService', function(d3Service, $location, SVGService) {
    'use strict';

    var regionClicked = function() {
        console.log(this.id);

        // TODO: Order input logic
    };

    var getCentroid = function(selection) {
        var   bbox = selection.getBBox();
        // return the center of the bounding box
        return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
    };

    return {
        replace: true,
        scope: {
            variant: '=variant',        // full variant data (JSON)
            moves: '=moves',            // movement data, full or partial (JSON)
            readonly: '=readonly',      // whether to allow user interaction (bool)
            arrows: '=arrows'           // whether to show movement arrows -- true implies 'moves' is defined (bool)
        },
        restrict: 'E',
        link: function(scope, element, attrs) {
            var absURL = $location.absUrl();
            element = element[0];

            scope.$watch('variant', function(variant) {
                if (variant.name) {
                    d3Service.xml('variants/' + scope.variant.name + '/' + scope.variant.name + '.svg', 'image/svg+xml', function(xml) {
                        // STEP 1: build base SVG

                        var svg = d3Service.select(element)
                            .append('svg')
                            .attr("width", '100%')              // TODO: change?
                            .attr("viewBox", '0 0 1152 965');   // TODO: do not hardcode viewBox dimensions

                        var defs = svg.append("svg:defs");
                        defs.selectAll("marker")
                            .data(['move', 'support'])      // Different link/path types can be defined here
                            .enter().append("svg:marker")    // This section adds in the arrows
                            .attr("id", String)
                            .attr("viewBox", "0 -5 10 10")
                            .attr("markerWidth", 6)
                            .attr("markerHeight", 6)
                            .attr("orient", "auto")
                            .append("svg:path")
                            .attr("d", "M0,-5L10,0L0,5");
                        SVGService.getStar(function(star) {
                            defs.append(function() { return star; })
                                .attr('id', 'sc')
                                .attr('fill', 'grey');
                        });

                        svg.append('g')
                            .append('svg:image')
                            .attr('x', 0)
                            .attr('y', 0)
                            .attr('xlink:href', 'variants/' + scope.variant.name + '/' + 'std_bit.png')  // TODO: find better filename for map BG
                            .attr('width', 1152)                // TODO: do not hardcode width
                            .attr('height', 965);               // TODO: do not hardcode height

                        var mouseLayer = svg.append(function() { return xml.documentElement.getElementById('MouseLayer'); })
                            .selectAll('path')
                            .attr('fill', 'transparent');

                        // STEP 2: if not readonly, apply UI events

                        if (!scope.readonly && xml)
                            mouseLayer.on('click', regionClicked);

                        var regions = svg.select('#MouseLayer').selectAll('path');

                        // STEP 3: apply SC dots

                        // strip regions without SC info
                        var scs = _.filter(scope.variant.regions, function(r) { return r.sc; });

                        // append SC group and one SC dot per collection item
                        var scGroup = svg.append('g')
                            .attr('class', 'scGroup')
                            .selectAll('path')
                            .data(scs)
                            .enter();

                        // append pretty coloured stars per SC
                        scGroup.append('use')
                            .attr('xlink:href', absURL + '#sc')
                            .attr('class', 'sc')
                            .attr('transform', function(d) { return 'translate(' + d.sc.x + ',' + d.sc.y + ') scale(0.04)'; })
                            .attr('fill', function(d) {
                                return 'blue';//scope.variant.powers[d.power].colour;
                            });

                        // centroids should be kept around in case hard coords are not available
                        var centroids = { };
                        for (var r = 0; r < regions[0].length; r++)
                            centroids[regions[0][r].id] = getCentroid(regions[0][r]);

                        // this will be useful
                        var regionDictionary = _.indexBy(scope.variant.regions, 'r');

                        // if moves supplied, render them
                        if (scope.moves) {
                            var links = [];
                            var baseNode = { fixed: true };
                            for (var s = 0; s < scope.moves.length; s++) {
                                var power = scope.moves[s];

                                // copy ownership info to region dict
                                for (var sc = 0; sc < power.scs.length; sc++) {
                                    var region = regionDictionary[power.scs[sc]];
                                    if (region)
                                        region.ownedBy = power.power;
                                }
                                for (var po = 0; po < power.moves.length; po++) {
                                    var order = power.moves[po];
                                    if (order.v) {
                                        links.push({
                                            source: _.defaults(regionDictionary[order.u], { fixed: true }),
                                            target: _.defaults(regionDictionary[order.v], { fixed: true, action: order.action })
                                        });
                                    }
                                }
                            }

                            var force = d3Service.layout.force()
                                .nodes(scope.variant.regions)
                                .links(links);

                                force.start();
                                  for (var i = 100; i > 0; --i) force.tick();
                                  force.stop();

                            svg.append('svg:g')
                                .selectAll("path")
                                  .data(force.links())
                                .enter().append("svg:path")
                                .attr("marker-end", function(d) {
                                    return 'url(' + absURL + '#' + d.target.action + ')'; })
                                .attr('class', 'link move')
                                .attr("d", function(d) {
                                    var dx = d.target.x - d.source.x,
                                        dy = d.target.y - d.source.y,
                                        dr = Math.sqrt(dx * dx + dy * dy);
                                    return "M" +
                                        d.source.x + "," +
                                        d.source.y + "A" +
                                        dr + "," + dr + " 0 0,1 " +
                                        d.target.x + "," +
                                        d.target.y;
                                });
                        }
                    });
                }
            });
        }
    };
}]);
