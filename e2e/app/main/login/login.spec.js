var page;

describe('Login', function() {
    beforeEach(function() {
        page = require('./login.po');
        page.get();
    });

    it('redirects to the profile page on success', function() {
        page.username.sendKeys('gooduser');
        page.password.sendKeys('goodpassw0rd');
        page.submitButton.click();
        expect(browser.getCurrentUrl()).toMatch(/\profile/);
    });
});
