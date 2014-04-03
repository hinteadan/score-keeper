'use strict';

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    grunt.initConfig({
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            'build/*',
                            '!build/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
        },
        concat: {
            options: {
                separator: '\r\n',
            },
            dist: {
                src: [
					'src/jsutils.js',
					'src/model.js',
					'src/skutils.js',
					'src/sklogistics.js',
					'src/championship.js'
				],
                dest: 'build/h.scoreKeeper.js',
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'src/{,*/}*.js'
            ]
        }
    });

    grunt.registerTask('build', [
        'clean:dist',
        'concat:dist'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);
};