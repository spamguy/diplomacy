var AppPage = function() {
    this.get = function() {
        browser.get(browser.baseUrl);
    };

    this.header = by.css('md-toolbar');
    this.floatingButton = by.id('floatingMenuButton');
};

module.exports = new AppPage();
