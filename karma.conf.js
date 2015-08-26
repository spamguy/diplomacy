'use strict';

module.exports = function (config) {
    config.set({
        preprocessors: {
            'client/app/**/*.html': ['ng-html2js']
        },
        frameworks: ['jasmine'],
        files: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'bower_components/d3/d3.js',
            'bower_components/lodash/lodash.js',
            'bower_components/humanize-duration/humanize-duration.js',
            'bower_components/socket.io-client/socket.io.js',
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
            'bower_components/angular-socket-io/socket.js',
            'bower_components/v-accordion/dist/v-accordion.js',

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
            'client/app/**/*.spec.js',

            // HTML files and templates
            'client/app/**/*.tmpl.html'
        ],
        logLevel:'ERROR',
        reporters:['spec'],
        autoWatch: false,
        singleRun: true,
        browsers: ['PhantomJS'],
        ngHtml2JsPreprocessor: {
            stripPrefix: 'client/',
            moduleName: 'templates'
        }
    });
};
