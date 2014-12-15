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
                dest: 'dist/app.css'
            }
        },
        uglify: {
            main: {
                files: {
                    'dist/app.min.js': 'temp/app.js'
                }
            }
        },
        ngtemplates: {
            main: {
                options: {
                    module: pkg.name,
                    htmlmin: '<%= htmlmin.main.options %>'
                },
                src: 'client/**/*.html',
                dest: 'temp/templates.js'
            }
        },
        htmlmin: {
            main: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                },
                files: {
                    'client/app/index.html': 'dist/index.html'
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        }
    });

    // grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    //     this.async();
    // });

    grunt.registerTask('build', ['jshint', 'clean:before', 'env:prod', 'preprocess', 'sass', 'ngtemplates', 'cssmin', /*'svgmin',*/ 'concat', 'uglify', 'htmlmin', 'clean:after']);
    grunt.registerTask('serve', ['jshint', 'env:dev', 'preprocess', 'sass', 'express:dev', 'open', 'watch']);
    grunt.registerTask('test', ['karma:all_tests']);
};
