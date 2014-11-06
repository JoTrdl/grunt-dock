'use strict';


var Docker = require('dockerode'),
    fs = require('fs');


/*
 * Commands:
 *  - build
 *  - clean
 *  - delete
 *  - start
 *  - stop
 *  - restart
 *  - list containers / list image
 */
module.exports = function(grunt) {

  grunt.initConfig({
    dock: {
      // Apply to All
      options: {

        docker: {
          protocol: 'https',
          host: '192.168.59.103',
          port: '2376',

          ca: fs.readFileSync('/Users/JohannTDL/.boot2docker/certs/boot2docker-vm/ca.pem'),
          cert: fs.readFileSync('/Users/JohannTDL/.boot2docker/certs/boot2docker-vm/cert.pem'),
          key: fs.readFileSync('/Users/JohannTDL/.boot2docker/certs/boot2docker-vm/key.pem')
        }
        
      },

      // Dev
      dev: {
        options: {
         /* protocol: 'http',
          host: '192.168.59.103',
          port: '2376',*/

          images: [
            {tag: 'altar/dev', dockerfile: 'Dockerfile'},
            {tag: 'altar/dev2', dockerfile: 'Dockerfile'}
          ]
        }
      }
    }
  });


  var commands = {
    list:  { handler: require('./lib/list'),  description: 'List images/containers' },
    clean: { handler: require('./lib/clean'), description: 'Clean old images/containers' },
    build: { handler: require('./lib/build'), description: 'Build an image' }
  };

  /**
   * List / Clean Grunt Task.
   * 
   * Usage:
   *   docker:list:image | docker:list:container
   *   docker:clean:image | docker:clean:container
   *   
   */
  ['list', 'clean'].forEach(function(command) {
    grunt.task.registerTask('dock:' + command, commands[command].description, function(arg) {
    
      // Fake the default Grunt this.options
      this.options = function(options) {
        var config = {};
        for (var name in grunt.config.data.dock.options) {
          config[name] = grunt.config.data.dock.options[name];
          if (!config[name]) config[name] = options[name];
        }
        return config;
      };

      var func = commands[command].handler[arg];
      if (!func) {
        grunt.fail.fatal('Command [' + command + ':' + arg + '] not found.');
      }

      func.apply(this, [grunt]);
    });
  });


  /**
   * Grunt task depending on config.
   * 
   * @param  {String} command the command to execute
   * @param  {String} arg     The arg to the command
   */
  grunt.registerMultiTask('dock', 'Dock for docker', function(command, arg) {
   
    if (!commands[command]) {
      grunt.fail.warn('Command [' + command + '] not found.');
      return;
    }

    // Check arg
    if (typeof(commands[command].handler) != 'function') {
      if (!commands[command].handler[arg]) {
        grunt.fail.warn('Argument [' + arg + '] for [' + command + '] not found.');
        return;
      }
    }

    var func = (arg) ? commands[command].handler[arg] : commands[command].handler;
    func.apply(this, [grunt]);
  });

};