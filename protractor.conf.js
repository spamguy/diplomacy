// primarily inspired by https://github.com/marmelab/ng-admin/blob/master/src/javascripts/test/protractor.conf.js
exports.config = {
    // sauce plz
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    baseUrl: 'http://' + (process.env.CI ? 'diplio' : 'localhost') + ':9000', // 'diplio': see .travis.yml

    specs: ['e2e/**/*.spec.js'],
    framework: 'jasmine',
    maxSessions: 1,
    multiCapabilities: [
        {'browserName': 'chrome'},
        {'browserName': 'firefox'},
        {'name': 'diplomacy'},
        {'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER ? process.env.TRAVIS_JOB_NUMBER : null},
        {'build': process.env.TRAVIS_BUILD_NUMBER ? process.env.TRAVIS_BUILD_NUMBER : null}
    ],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 360000,
        includeStackTrace: true
    }
}
