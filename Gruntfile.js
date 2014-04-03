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
                separator: ';',
            },
            dist: {
                src: ['intro.js', 'src/project.js', 'src/outro.js'],
                dest: 'bnuild/h.sk.js',
            },
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
        'clean:dist'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);
};