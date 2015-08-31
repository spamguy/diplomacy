var AppPage = function() {
    this.get = function() {
        browser.get(browser.baseUrl);
    };

    this.header = by.css('md-toolbar');
    this.navButton = by.id('navButton');
};

module.exports = new AppPage();
