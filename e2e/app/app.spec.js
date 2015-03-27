var AppPage = function() {
    this.get = function() {
        browser.get(browser.baseUrl);
    };

    this.header = by.css('md-toolbar');
};

describe('Page base', function() {
    var page;

    beforeEach(function() {
        page = new AppPage();
    });

    it('has a header', function() {
        page.get();

        expect(browser.driver.isElementPresent(page.header)).toBe(true);
    });
});
