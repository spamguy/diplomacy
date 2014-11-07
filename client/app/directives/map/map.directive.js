angular.module('app.directives', ['d3Service'])
	.directive('sgMap', function() {
			return {
				scope: {
					variant: '=variant',
					positions: '=positions',
					readonly: 'readonly'
				},
				restrict: 'E',
				link: function(scope, element, attrs, mapControl) {
				  mapControl.init(element);
				}
			};
		}
	);

//				d3.xml('assets/images/bitmap_std.svg', 'image/svg+xml', function(xml) {
//					document.body.appendChild(xml.documentElement);
//				});