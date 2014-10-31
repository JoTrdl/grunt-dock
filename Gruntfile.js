var Docker = require('dockerode');
var fs = require('fs');

var defaultOptions = {
  protocol: 'http',
  host: '192.168.59.103',
  port: '2376'
};

var commands = {};

commands['list'] = {};
commands['list']['images'] = function(grunt) {

  var options = this.options(defaultOptions);
  var docker = new Docker(options);

  var done = this.async();

    // 12
  


  grunt.log.subhead('REPOSITORY:TAG')
  docker.listImages({all: false}, function(err, images) {
    grunt.log.writeln(JSON.stringify(images));
    for (i in images) {
      for (j in images[i].RepoTags) {
        grunt.log.writeln(images[i].RepoTags[j], "   ", images[i].Id.split("").slice(0,12).join(""));
      }
    }
    grunt.verbose.ok();
    done();
  });
};

'use strict';

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
    docker: {
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
          dockerfile: 'Dockerfile.tar'
        }
      }
    }
  });


  grunt.task.registerTask('docker:list', 'List images/containers', function(arg) {
    
    // Fake the default Grunt this.options
    this.options = function(options) {
      var config = {};
      for (var name in grunt.config.data.docker.options) {
        config[name] = grunt.config.data.docker.options[name];
        if (!config[name]) config[name] = options[name]; 
      }
      return config;
    };

    var func = commands['list'][arg];
    if (!func) {
      grunt.fail.fatal('Command [list:' + arg + '] not recognized.');
    }

    func.apply(this, [grunt]);
  
  });

  grunt.registerMultiTask('docker', 'Docker management', function(command, arg) {
   
    

    grunt.log.writeln('command:', command, ', arg:', arg);

    if (!commands[command]) {
      grunt.fail.warn('Command [' + command + '] not recognized.');
      return;
    }

    // Check arg
    if (typeof(commands[command]) != 'function') {
      if (!commands[command][arg]) {
        grunt.fail.warn('Argument [' + arg + '] for [' + command + '] not recognized.');
        return;
      }
    }

    var func = (arg) ? commands[command][arg] : commands[command];
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