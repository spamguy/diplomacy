'use strict';

describe('Service: authInterceptor', function () {
    // load the service's module
    beforeEach(module('diplomacy'));

    // instantiate service
    var authInterceptor;
    beforeEach(inject(function (_authInterceptor_) {
        authInterceptor = _authInterceptor_;
    }));

    it('returns an instance of authInterceptor', function () {
        expect(!!authInterceptor).toBe(true);
    });
});
