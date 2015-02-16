// Generated on 2014-10-02 using generator-angular-fullstack 2.0.13
'use strict';

var pkg = require('./package.json');

module.exports = function(grunt) {

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        express: {
            dev: {
                options: {
                    port: 9001,
                    script: 'server/server.js'
                }
            },
            prod: {
                options: {
                    port: 9001,
                    script: 'dist/server/server.js'
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:9000'
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

            // serverTest: {
            //     options: {
            //         jshintrc: 'server/.jshintrc-spec'
            //     },
            //     src: ['server/**/*.spec.js']
            // },
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
                src: ['dist', 'temp']
            },
            after: {
                src: ['temp']
            }
        },
        useminPrepare: {
            html: 'client/app/index.html',
            options: {
                dest: 'dist',
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
        concat: {
            js: {
                src: ['client/**/*.js', '!client/**/*.spec.js'],
                dest: 'temp/app.js'
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
                dest: 'dist/client/app.css'
            }
        },
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'temp',
                    src: '*.js',
                    dest: 'temp'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'client',
                    dest: 'dist/client',
                    src: [
                        'index.html'
                    ]
                }, {
                    expand: true,
                    dest: 'dist',
                    src: [
                        'package.json',
                        'server/**/*'
                    ]
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
    uglify: {
        main: {
            files: {
                'dist/client/app.min.js': 'temp/app.js'
            }
        }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        protractor: {
            options: {
                configFile: 'protractor.conf.js'
            },
            e2e: {
                options: {
                    keepAlive: false
                }
            }
        }
    });

    // grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    //     this.async();
    // });

    grunt.registerTask('build', ['jshint', 'clean:before', 'env:prod', 'preprocess', 'useminPrepare', 'concat', 'ngAnnotate', 'copy:dist', 'sass', 'cssmin', 'uglify', 'usemin', 'htmlmin', 'clean:after']);
    grunt.registerTask('serve', ['jshint', 'env:dev', 'preprocess', 'sass', 'express:dev', 'open', 'watch']);
    grunt.registerTask('test', ['karma', 'protractor:e2e']);
};
