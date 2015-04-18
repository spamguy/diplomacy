/* Primarily inspired by:
 * - https://github.com/marmelab/ng-admin/blob/master/src/javascripts/test/protractor.conf.js
 * - https://github.com/angular/angular.js/blob/master/protractor-shared-conf.js
 */
exports.config = {
    // sauce plz
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    baseUrl: 'http://localhost',

    specs: ['e2e/**/*.po.js', 'e2e/**/*.spec.js'],
    framework: 'jasmine',
    maxSessions: 1,
    allScriptsTimeout: 40000,
    getPageTimeout: 40000,
    rootElement: 'html',
    multiCapabilities: [
        capabilitiesForBrowser('chrome', '41'),
        capabilitiesForBrowser('firefox'),
        capabilitiesForBrowser('safari')
    ],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 360000,
        includeStackTrace: true
    },
    onPrepare: function() {
        require('protractor-http-mock').config = {
            protractorConfig: 'protractor-travis.conf'
        };
    }
};

function capabilitiesForBrowser(browserName, browserVersion) {
    var capabilities = {
        'browserName': browserName,
        'build': process.env.TRAVIS_BUILD_NUMBER,
        'name': 'dipl.io'
    };
    if (browserVersion)
        capabilities.version = browserVersion;

    return capabilities;
}
