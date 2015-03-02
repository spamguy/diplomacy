exports.config = {
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    specs: ['e2e/**/*.spec.js'],
    framework: 'jasmine',
    multiCapabilities: [
        {'browserName': 'chrome'},
        {'browserName': 'firefox'},
        {'name': 'diplomacy'}
    ],
}
