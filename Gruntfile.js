module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    // Print a timestamp (useful for when watching)
    grunt.registerTask('timestamp', function() {
        grunt.log.subhead(Date());
    });

    /**
     * Project configuration.
     */
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner:
        '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n */\n',
        src: {
            src_js: ['lib/*.js'],
            test_js: ['test/test-*.js'],
            demos: ['test/*.html']
        },

        watch: {
          scripts: {
            files: ['lib/*.js', 'lib/*/*.js', '*.js', 'test/*.js', 'node_modules/js-2dmath/lib/*.js', 'node_modules/js-2dmath/*.js'],
            tasks: ['dist'],
            options: {
              debounceDelay: 500
            },
          },
        },
        connect: {
          server: {
            options: {
              keepalive: true,
              port: 8000,
              listen: "127.0.0.1",
              onCreateServer: function(server, connect, options) {

              }
            }
          }
        }
    }); // end config

    grunt.task.registerTask('server', ['connect:server:keepalive']);
    grunt.task.registerTask('dist', 'Generate debug files', function(arg1, arg2) {
        var done = this.async();
        require("child_process").exec("browserify -r ./index.js:mage -o ./dist/mage.js", function() {
            console.log(arguments);
            done();
        });
    });
};
