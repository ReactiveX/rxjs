module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('../../package.json'),

    run: {
      sauce: {
        args: ['./mocha.sauce.runner.js'],
        options: {
          wait: true,
          cwd: './'
        }
      }
    },

    connect: {
      server: {
        options: {
          base: '../../',
          port: 9876
        }
      }
    }
  });

  var parentcwd = process.cwd();
  process.chdir('../../');

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-run');

  process.chdir(parentcwd);

  grunt.registerTask('default', ['connect', 'run:sauce']);
};