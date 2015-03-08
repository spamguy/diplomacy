// Generated on 2014-10-02 using generator-angular-fullstack 2.0.13
'use strict';

module.exports = function(grunt) {

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        // environment variable pkg
        pkg: grunt.file.readJSON("package.json"),

        express: {
            dev: {
                options: {
                    script: 'server/server.js'
                }
            },
            prod: {
                options: {
                    script: 'dist/server/server.js'
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost'
            }
        },
        watch: {
            main: {
                options: {
                    livereload: true,
                    livereloadOnError: false,
                    spawn: false
                },
                files: ['client/**/*.js', 'client/**/*.html'],
                tasks: [] //all the tasks are run dynamically during the watch event handler
            }
        },
        env: {
            options: {

            },
            dev: {
                NODE_ENV: 'DEVELOPMENT'
            },
            prod: {
                NODE_ENV: 'PRODUCTION'
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
        changelog: {
            repository: 'https://github.com/spamguy/diplomacy'
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        protractor: {
            e2e: {
                configFile: 'protractor.conf.js',
                keepAlive: true
            }
        }
    });

    grunt.registerTask('build', [
        'jshint',
        'clean:before',
        'env:prod',
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
        'changelog',
        'clean:after'
    ]);
    grunt.registerTask('serve', ['jshint', 'env:dev', 'preprocess', 'wiredep', 'sass', 'express:dev', 'open', 'watch']);
    grunt.registerTask('test', ['karma', 'express:dev', 'protractor:e2e']);
    grunt.registerTask('travis', []);
};
