'use strict';

angular.module('games.directive', [
	'd3Service'
])
.controller('MapController', ['$scope', 'd3Service', function($scope, d3Service) {
		var self = this,
			scope = $scope.$new();

		this.init = function(element) {
			self.$element = element;
			
//				d3.xml('assets/images/bitmap_std.svg', 'image/svg+xml', function(xml) {
//					document.body.appendChild(xml.documentElement);
//				});
		};
	}]
)
.directive('sgMap', function() {
		return {
			restrict: 'EA',
			controller: 'MapController',
			link: function(scope, element, attrs, mapControl) {
			  mapControl.init(element);
			}
		};
	}
);
