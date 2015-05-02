'use strict';

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            'bower_components/lodash/lodash.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js', // for the love of god, stop deleting this!
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/hammerjs/hammer.js',
            'bower_components/angular-local-storage/dist/angular-local-storage.js',
            'bower_components/angular-jwt/dist/angular-jwt.js',
            'bower_components/restangular/dist/restangular.js',
            'bower_components/angular-material/angular-material.js',
            'bower_components/angular-aria/angular-aria.js',

            // client files
            'client/app/app.module.js',
            'client/app/app.controller.js',
            'client/app/**/*.service.js',
            'client/app/**/*.directive.js',
            'client/app/**/*.module.js',
            'client/app/**/*.state.js',
            'client/app/**/*.filter.js',
            'client/app/**/*.controller.js',
            'client/app/**/*.html',
            'client/app/**/*.spec.js'
        ],
        logLevel:'ERROR',
        reporters:['spec'],
        autoWatch: false,
        singleRun: true,
        browsers: ['PhantomJS'],
        preprocessors: {
            'app/**/*.html': 'html2js'
        },
        ngHtml2JsPreprocessor: {
            // strip app from the file path
            stripPrefix: 'app/'
        }
    });
};
