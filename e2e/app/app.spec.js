var page;

describe('Page base', function() {
    beforeEach(function() {
        page = require('./app.po');

        page.get();
    });

    it('has a header', function() {
        expect(browser.driver.isElementPresent(page.header)).toBe(true);
    });

    it('has a floating button', function() {
        expect(browser.driver.isElementPresent(page.floatingButton)).toBe(true);
    });
});
