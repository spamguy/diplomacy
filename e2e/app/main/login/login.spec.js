var mock = require('protractor-http-mock');

var LoginPage = function() {
    this.get = function() {
        browser.get(browser.baseUrl + '/main/login');
    };

    this.username = element(by.name('username'));
    this.password = element(by.name('password'));
    this.submitButton = element(by.id('loginButton'));
};

describe('Good logins', function() {
    mock([{
            request: {
                path: '/auth/login',
                method: 'POST'
            },
            response: {
                data: {
                    id: '123456789abcdef123456789',
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
                }
            }
        }, {
            request: {
                path: '/users/123456789abcdef123456789/games',
                method: 'GET'
            },
            response: {
                data: []
            }
        }
    ]);

    var page;

    beforeEach(function() {
        page = new LoginPage();
        page.get();
    });

    afterEach(function() {
        mock.teardown();
    })

    it('redirects to the profile page on success', function() {
        mock.clearRequests();
        page.username.sendKeys('gooduser');
        page.password.sendKeys('goodpassw0rd');
        page.submitButton.click();

        expect(browser.getCurrentUrl()).toMatch(/\profile/);

    });
});

describe('Bad logins', function() {
    'use strict';

    var page;

    beforeEach(function() {
        page = new LoginPage();
        page.get();
    });

    it('disables login for empty fields', function() {
        expect(page.submitButton.isEnabled()).toBe(false);

        page.username.sendKeys('gooduser');

        expect(page.submitButton.isEnabled()).toBe(false);
    });

    it('displays an error on a bad username', function() {
    });

    it('displays an error on a bad password', function() {
    });
});
