'use strict';

module.exports = function (config) {
	config.set({
		frameworks: ['jasmine'],
        files: [
          //'node_modules/jquery/dist/jquery.js',
          'bower_components/lodash/lodash.js',
	      'node_modules/angular/angular.js',
	      'node_modules/angular-mocks/angular-mocks.js',
	      'node_modules/angular-ui-router/release/angular-ui-router.js',
	      'node_modules/angular-ui-form-validation/dist/angular-ui-form-validation.js',
	      'bower_components/angular-animate/angular-animate.js',
          'bower_components/hammerjs/hammer.js',
	      'node_modules/angular-local-storage/dist/angular-local-storage.js',
	      'node_modules/angular-jwt/dist/angular-jwt.js',
	      'node_modules/restangular/dist/restangular.js',
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
        reporters:['mocha'],
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
