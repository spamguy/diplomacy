var page;

describe('Good logins', function() {
    beforeEach(function() {
        page = require('./login.po.js');
        page.get();
    });

    it('redirect to the profile page on success', function() {
        page.username.sendKeys('gooduser');
        page.password.sendKeys('goodpassw0rd');
        page.submitButton.click();
        expect(browser.getCurrentUrl()).toMatch(/\profile/);
    });
});
