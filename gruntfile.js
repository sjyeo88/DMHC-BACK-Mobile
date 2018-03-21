module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    ts: {
      app: {
        files: [{
          src: ['src/**/*.ts', '!src/.baseDir.ts'],
          dest: "./dist"
        }],
        tsconfig: {
          tsconfig: "./tsconfig.json"
        }
        // options: {
        //   module: "commonjs",
        //   // target: "es6",
        //   target: "es2015",
        //   sourceMap: false
        // }
      }
    },

    watch: {
      ts: {
        files: ["src/\*\*/\*.ts"],
        tasks: ["ts"]
      },
    }
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-shell");
 // grunt.registerTask('server', ['default', 'shell:connect']);

  // grunt.registerTask("default", [
  //   "ts", "watch"
  // ]);

};
