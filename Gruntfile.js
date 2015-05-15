'use strict';

module.exports = function(grunt) {
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // for smarter date formatting
    var moment = require('moment');

    var formatDate = function() {
        return moment().format('YYYYMMDD');
    };

    grunt.initConfig({
        // environment variable pkg
        pkg: grunt.file.readJSON("package.json"),

        concurrent: {
            dev: {
                tasks: ['startserver', 'open'],
                options: {
                    logConcurrentOutput: true
                }
            },
            travis: {
                tasks: ['nodemon:dev', 'sauce-travis'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        nodemon: {
            dev: {
                script: 'server/server.js'
            }
        },
        open: {
            server: {
                url: 'http://localhost/main/home'
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
                tasks: [] //all the tasks are run dynamically during the watch event handler
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
                        apiEndpoint: 'http://private-182900-diplio.apiary-mock.com'
                    }
                }
            },
            mongo: {
                constants: {
                    CONST: {
                        apiEndpoint: 'http://localhost/api'
                    }
                }
            }
        },
        preprocess: {
            main: {

            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            server: {
                options: {
                    jshintrc: 'server/.jshintrc'
                },
                src: [
                    'server/**/*.js',
                    '!server/**/*.spec.js'
                ]
            },
            all: [
                'client/{app,components}/**/*.js',
                '!client/{app,components}/**/*.spec.js',
                '!client/{app,components}/**/*.mock.js'
            ],
            test: {
                src: [
                    'client/{app,components}/**/*.spec.js',
                    'client/{app,components}/**/*.mock.js'
                ]
            }

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

        // Performs rewrites based on filerev and the useminPrepare configuration
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
                    }
                ]
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
                            '!server/config/local.env.js'
                        ]
                    }, {
                        expand: true,
                        cwd: '.tmp/concat',
                        dest: 'dist/client',
                        src: ['*']
                    }
                ]
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
        protractor: {
            travis: {
                options: {
                    configFile: 'protractor-travis.conf.js',
                    args: {
                        sauceUser: process.env.SAUCE_USERNAME,
                        sauceKey: process.env.SAUCE_ACCESS_KEY
                    }
                }
            },
            local: {
                options: {
                    configFile: 'protractor-local.conf.js'
                    //,debug: true
                }
            }
        }
    });

    grunt.registerTask('sauce-connect', 'Launch Sauce Connect', function () {
        var done = this.async();
        require('sauce-connect-launcher')({
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY
        }, function (err, sauceConnectProcess) {
            if (err) {
                console.error(err.message);
            } else {
                done();
            }
        });
    });

    grunt.registerTask('build', [
        'jshint',
        'clean:before',
        'ngconstant:mongo',
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
    grunt.registerTask('startserver', ['nodemon:dev', 'watch']);
    grunt.registerTask('sauce-travis', ['sauce-connect', 'protractor:travis']);
    grunt.registerTask('serve', ['jshint', 'ngconstant:mongo', 'preprocess', 'wiredep', 'sass', 'concurrent:dev']);
    grunt.registerTask('test', ['ngconstant:mock', 'karma', 'protractor:local']);
    grunt.registerTask('test:protractor-travis', [
        'ngconstant:mock',
        'karma',
        'concurrent:travis'
    ]);
};
