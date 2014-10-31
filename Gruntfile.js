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
        protocol: 'https',
        host: '192.168.59.103',
        port: '2376',

        ca: fs.readFileSync('/Users/lwcha_troendlj/.boot2docker/certs/boot2docker-vm/ca.pem'),
        cert: fs.readFileSync('/Users/lwcha_troendlj/.boot2docker/certs/boot2docker-vm/cert.pem'),
        key: fs.readFileSync('/Users/lwcha_troendlj/.boot2docker/certs/boot2docker-vm/key.pem')
      },

      // Dev
      dev: {
        options: {
         /* protocol: 'http',
          host: '192.168.59.103',
          port: '2376',*/

          tag: 'altar/dev',
          dockerfile: 'Dockerfile'
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
        for (var name in grunt.config.data.docker.options) {
          config[name] = grunt.config.data.docker.options[name];
          if (!config[name]) config[name] = options[name];
        }
        return config;
      };

      var func = commands[command].handler[arg];
      if (!func) {
        grunt.fail.fatal('Command [' + command + ':' + arg + '] not recognized.');
      }

      func.apply(this, [grunt]);
    });
  });


  grunt.registerMultiTask('dock', 'Docker management', function(command, arg) {
   
    grunt.log.writeln(JSON.stringify(commands));

    grunt.log.writeln('command:', command, ', arg:', arg);

    if (!commands[command]) {
      grunt.fail.warn('Command [' + command + '] not recognized.');
      return;
    }

    // Check arg
    if (typeof(commands[command].handler) != 'function') {
      if (!commands[command].handler[arg]) {
        grunt.fail.warn('Argument [' + arg + '] for [' + command + '] not recognized.');
        return;
      }
    }

    var func = (arg) ? commands[command].handler[arg] : commands[command].handler;
    func.apply(this, [grunt]);
    

    //grunt.log.writeln(JSON.stringify(options));
    //grunt.log.writeln(this.target + ': ' + JSON.stringify(this.data));

    

    

   /* docker.buildImage(options.dockerfile, {t: options.tag}, function(err, stream) {
      grunt.log.writeln('Building image')

      if (err) {
        grunt.log.errorlns(err);
        return;
      }

      stream.setEncoding('utf8');

      stream.on('data', function(data) {
        var jsonData = JSON.parse(data);
        grunt.log.writeln(jsonData.stream)
      });

      stream.on('end', function() {
        done();
      });
    });*/
    
    
    

    

  });

};