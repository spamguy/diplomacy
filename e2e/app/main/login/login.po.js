var LoginPage = function() {
    this.get = function() {
        browser.get(browser.baseUrl + '/main/login');
    };

    this.username = element(by.name('username'));
    this.password = element(by.name('password'));
    this.submitButton = element(by.id('loginButton'));
    this.validLoginMessage = element(by.id('validLoginMessage'));
};

module.exports = new LoginPage();
