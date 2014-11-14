'use strict';

describe('map.directives', function () {
	var scope,
		el;

	beforeEach(function() {
		module('map.directives');
	});

	beforeEach(function() {
		inject(function ($injector, $rootScope, $compile, $q, _$timeout_) {
			scope = $rootScope.$new();

			scope.variant = {
				name: 'standard'
			};

            el = $compile('<sg-map variant="variant" readonly="readonly" />')(scope);
        });
    });

    it('scope values are set', function() {
		scope.readonly = true;
        scope.$digest();

    	var isolated = el.isolateScope();
    	expect(isolated.variant.name).toBe('standard');
    	expect(isolated.readonly).toBe(true);
    });
});