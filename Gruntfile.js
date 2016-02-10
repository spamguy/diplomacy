'use strict';

module.exports = function(grunt) {
    // load all grunt tasks
    require('jit-grunt')(grunt, {
        ngconstant: 'grunt-ng-constant',
        express: 'grunt-express-server',
        useminPrepare: 'grunt-usemin',
        ngtemplates: 'grunt-angular-templates',
        replace: 'grunt-text-replace'
    });

    // for smarter date formatting
    var moment = require('moment'),
        formatDate = function() {
            return moment().format('YYYYMMDD');
        };

    grunt.initConfig({
        // environment variable pkg
        pkg: grunt.file.readJSON('package.json'),

        express: {
            dev: {
                options: {
                    script: 'server/server.js'
                }
            }
        },
        open: {
            server: {
                url: 'https://localhost/main/home'
            }
        },
        watch: {
            main: {
                options: {
                    livereload: false,
                    livereloadOnError: false,
                    spawn: false
                },
                files: ['client/**/*.js', 'client/**/*.html'],
                tasks: []
            }
        },
        ngconstant: {
            options: {
                name: 'diplomacy.constants',
                dest: 'client/temp/constants.js'
            },
            mock: {
                constants: {
                    CONST: {
                        apiEndpoint: 'http://private-182900-diplio.apiary-mock.com',
                        socketEndpoint: 'https://localhost'
                    }
                }
            },
            mongo: {
                constants: {
                    CONST: {
                        apiEndpoint: 'https://localhost/api',
                        socketEndpoint: 'https://localhost'
                    }
                }
            },
            prod: {
                constants: {
                    CONST: {
                        apiEndpoint: 'https://dipl.io/api',
                        socketEndpoint: 'https://dipl.io'
                    }
                }
            }
        },
        preprocess: {
            main: {

            }
        },
        eslint: {
            options: {
            },
            target: [
                'server/**/*.js',
                '!server/**/*.spec.js',
                '!server/diplomacy-godip/**/*.js'
            ]
        },
        clean: {
            before: {
                src: ['.tmp', 'temp', 'dist']
            },
            after: {
                src: ['.tmp']
            }
        },
        useminPrepare: {
            html: 'client/index.html',
            options: {
                dest: 'dist/client',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration.
        usemin: {
            html: ['dist/{,*/}*.html'],
            css: ['dist/styles/{,*/}*.css'],
            options: {
                assetsDirs: [
                    'dist',
                    'dist/assets'
                ]
            }
        },
        sass: {
            server: {
                options: {
                    loadPath: [
                        'node_modules',
                        'client/app'
                    ],
                    compass: false
                },
                files: {
                    'client/temp/app.css': 'client/app/app.scss'
                }
            }
        },
        cssmin: {
            css: {
                src: 'client/temp/app.css',
                dest: 'dist/client/app.min.css'
            }
        },
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat',
                    src: '*.js',
                    dest: '.tmp/concat'
                }]
            }
        },
        ngtemplates: {
            options: {
                module: 'diplomacy',
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }
            },
            main: {
                cwd: 'client',
                src: ['{app,components}/**/*.html'],
                dest: '.tmp/templates.js'
            }
        },
        replace: {
            footer: {
                src: ['dist/client/*.html'],
                overwrite: true,
                replacements: [{
                    from: '{{VERSION}}',
                    to: '<%= pkg.version %>'
                }, {
                    from: '{{TIMESTAMP}}',
                    to: formatDate()
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'client',
                    dest: 'dist/client',
                    src: ['index.html', 'robots.txt', 'assets/**']
                }, {
                    expand: true,
                    dest: 'dist',
                    src: [
                        'server/**/*',
                        'variants/**/*',
                        '!server/config/local.env.js',
                        '!server/diplomacy-godip/node_modules/**/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/concat',
                    dest: 'dist/client',
                    src: ['*']
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: 'dist/client',
                    src: ['*.html'],
                    dest: 'dist/client'
                }]
            }
        },
        wiredep: {
            target: {
                src: 'index.html',
                ignorePath: 'client'
            }
        },
        concat: {
            templates: {
                src: ['.tmp/concat/app.min.js', '.tmp/templates.js'],
                dest: '.tmp/concat/app.min.js'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['server/**/*.spec.js', '!server/diplomacy-godip/**/*.spec.js']
            }
        }
    });

    grunt.registerTask('sauce-connect', 'Launch Sauce Connect', function() {
        var done = this.async();
        require('sauce-connect-launcher')({
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY
        }, function(err, sauceConnectProcess) {
            if (err)
                console.error(err.message);
            else
                done();
        });
    });

    grunt.registerTask('build', [
        // 'eslint',
        'clean:before',
        'ngconstant:prod',
        'preprocess',
        'wiredep',
        'useminPrepare',
        'ngtemplates',
        'concat:generated',
        'concat:templates',
        'ngAnnotate',
        'copy:dist',
        'sass',
        'usemin',
        'htmlmin',
        'cssmin',
        'replace:footer',
        'uglify',
        'clean:after'
    ]);

    grunt.registerTask('serve', [
        // 'eslint',
        'ngconstant:mongo',
        'preprocess',
        'wiredep',
        'sass',
        'express:dev',
        'open',
        'watch'
    ]);
    grunt.registerTask('test', ['ngconstant:mock', 'karma', 'mochaTest']);
    grunt.registerTask('test:protractor-travis', [
        'ngconstant:mock',
        'karma',
        'mochaTest',
        'express:dev',
        'sauce-connect',
        'protractor:travis'
    ]);
};
