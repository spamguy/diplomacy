angular.module('map.directives', ['SVGService'])
.directive('sgMap', ['$location', 'SVGService', function($location, SVGService) {
    'use strict';

    var regionDictionary = {};

    var absURL = '';

    var regionClicked = function() {
        console.log(this.id);

        // TODO: Order input logic
    };

    var generateCurvedArrow = function(d) {
        var dx = regionDictionary[d.target.r].x - regionDictionary[d.source.r].x,
            dy = regionDictionary[d.target.r].y - regionDictionary[d.source.r].y,
            dr = Math.sqrt(dx * dx + dy * dy);

        return 'M' + regionDictionary[d.source.r].x + ',' + regionDictionary[d.source.r].y + 'A' + dr + ',' + dr + ' 0 0,1 ' + regionDictionary[d.target.r].x + ',' + regionDictionary[d.target.r].y;
    };

    var generateMarkerEnd = function(d) {
        // see CSS file for why separate markers exist for failed orders
        var failed = d.target.failed ? 'failed' : '';
        return 'url(' + absURL + '#' + failed + d.target.action + ')'; };

    var generateSVG = function(variant, season, readonly, el) {
        if (!variant || !season)
            return;

        absURL = $location.absUrl();

        variant = variant.data;
        season = season[0];
        d3.xml('variants/' + variant.name + '/' + variant.name + '.svg', 'image/svg+xml', function(xml) {
            if (!xml)
                return;

            regionDictionary = _.indexBy(variant.regions, 'r');

            // STEP 1: build root <svg> -------------------
            var svg = d3.select(el)
                .append('svg')
                .attr('viewBox', '0 0 ' + xml.rootElement.getAttribute('width') + ' ' + xml.rootElement.getAttribute('height'));
            // --------------------------------------------

            // STEP 2: build templated items --------------
            var defs = svg.append('svg:defs');

            // generic curved arrow
            defs.selectAll('marker')
                .data(['move', 'support', 'failedmove', 'failedsupport'])      // mapping movement types to CSS classes
                .enter().append('svg:marker')
                .attr('id', String)
                .attr('viewBox', '0 -5 10 10')
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('orient', 'auto')
                .attr('class', function(d) {
                    return _.startsWith(d, 'failed') ? 'failed' : 'ok';
                })
                .append('svg:path')
                .attr('d', 'M0,-5L10,0L0,5');

            // supply centre star
            SVGService.getStar(function(star) {
                defs.append(function() { return star; })
                    .attr('id', 'sc');
            });
            // --------------------------------------------

            // STEP 3: add background image layer ---------
            svg.append('g')
                .append('svg:image')
                .attr('xlink:href', 'variants/' + variant.name + '/' + variant.name + '.png')
                .attr('width', '100%')
                .attr('height', '100%');
            // --------------------------------------------

            // STEP 4: add clickable region layer ---------
            var mouseLayer = svg.append(function() {
                return xml.documentElement.firstElementChild; })
                .selectAll('path');

            // add events to clickable layer if readonly disabled
            if (!readonly && xml)
                mouseLayer.on('click', regionClicked);
            // --------------------------------------------

            // STEP 5: apply supply centre (SC) dot layer -
            var scGroup = svg.append('g')
                .attr('id', 'scGroup')
                .selectAll('path')
                .data(_.filter(season.regions, function(r) { return !_.isUndefined(r.sc); }))
                .enter();

            // append one pretty coloured star per SC
            scGroup.append('use')
                .attr('xlink:href', absURL + '#sc')
                .attr('class', 'sc')
                .attr('transform', function(d) {
                    return 'translate(' + regionDictionary[d.r].sc.x + ',' + regionDictionary[d.r].sc.y + ') scale(0.03)'; })
                .attr('fill', function(d) {
                    return d.sc ? variant.powers[d.sc].colour : '#bbbbbb';
                });
            // --------------------------------------------

            // STEP 6: apply unit marker layer ------------
            var unitGroup = svg.append('g')
                .attr('id', 'unitGroup');

            // FIXME: Consider and render multiple units in a region.
            unitGroup
                .selectAll('circle')
                .data(_.filter(season.regions, function(r) { return r.units && r.units[0].type === 1; }))
                .enter()
                .append('circle')
                .attr('cx', function(d) { return regionDictionary[d.r].x; })
                .attr('cy', function(d) { return regionDictionary[d.r].y; })
                .attr('r', 10)
                .attr('stroke-width', '1px')
                .attr('stroke', '#000')
                .attr('fill', function(d) {
                    return variant.powers[d.units[0].power].colour;
                });

            // FIXME: Consider and render multiple units in a region.
            unitGroup
                .selectAll('rect')
                .data(_.filter(season.regions, function(r) {
                    return r.units && r.units[0].type === 2;
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
                .attr('width', 20)
                .attr('stroke-width', '1px')
                .attr('stroke', '#000')
                .attr('fill', function(d) {
                    return variant.powers[d.units[0].power].colour;
                });
            // --------------------------------------------

            var links = [];
            var baseNode = { fixed: true };
            for (var s = 0; s < season.regions.length; s++) {
                var region = season.regions[s];
                if (region.unit && region.unit.order && region.unit.order.action) {
                    var target = region.unit.order.y1 || region.unit.order.y2;
                    links.push({
                        source: _.defaults(region, { fixed: true }),
                        target: _.defaults(regionDictionary[target], {
                            fixed: true, // to keep d3 from treating this map like a true force graph
                            action: region.units[0].order.action,
                            failed: region.units[0].order.failed
                        })
                    });
                }
            }

            if (links.length > 0) {
                var force = d3.layout.force()
                    .nodes(regionDictionary)
                    .links(links);

                var moveGroup = svg.append('g')
                    .attr('id', 'moveGroup')
                    .selectAll('path')
                    .data(force.links())
                    .enter();

                force.start();
                for (var i = 20; i > 0; --i) force.tick();
                force.stop();

                moveGroup
                    .append('svg:path')
                    .attr('marker-end', generateMarkerEnd)
                    .attr('class', function(d) {
                        var failed = d.target.failed ? 'failed ' : 'ok ';
                        return failed + 'link move';
                    })
                    .attr('d', generateCurvedArrow);
            }
        });
    };

    return {
        replace: true,
        scope: {
            variant: '=variant',               // full variant data (JSON)
            season: '=season',                 // movement data (JSON)
            readonly: '=readonly',             // whether to allow user interaction (bool)
            arrows: '=arrows'                  // whether to show movement arrows -- true implies season is defined (bool)
        },
        restrict: 'E',
        link: function(scope, element, attrs) {
            element = element[0];

            generateSVG(scope.variant, scope.season, scope.readonly, element);
        }
    };
}]);
