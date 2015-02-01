module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    jshint: {
      all: ['src/*.js', 'test/*.js']
    },
    qunit: {
      all: ['test/livepage.html']
    }
  });

  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('default', ['test', 'uglify']);
};
