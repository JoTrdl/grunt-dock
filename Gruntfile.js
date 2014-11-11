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
          version: 'v1.15',
          protocol: 'https',
          host: '192.168.59.103',
          port: '2376',

          ca: fs.readFileSync('/Users/lwcha_troendlj/.boot2docker/certs/boot2docker-vm/ca.pem'),
          cert: fs.readFileSync('/Users/lwcha_troendlj/.boot2docker/certs/boot2docker-vm/cert.pem'),
          key: fs.readFileSync('/Users/lwcha_troendlj/.boot2docker/certs/boot2docker-vm/key.pem')
        }
        
      },

      // Dev
      dev: {
        options: {

          images: {
            'altar/dev': {
              dockerfile: 'Dockerfile', 
              options: { 
                build:  { /* extra options to docker build  */ },
                create: { /* extra options to docker create */ },
                start:  { 
                  "Binds": ["/Users/lwcha_troendlj/Documents/altar:/bundle"],
                  "PortBindings": { "8080/tcp": [ { "HostPort": "8080" } ] }
                },
                stop:   { /* extra options to docker stop   */ },
                kill:   { /* extra options to docker kill   */ }
              }
            },

            'altar/dev2': {
              dockerfile: 'Dockerfile2',
              options: {
                build:  { /* extra options to docker build  */ },
                create: { /* extra options to docker create */ },
                start:  { 
                  "Binds": ["/Users/lwcha_troendlj/Documents/altar:/bundle"],
                  "PortBindings": { "8080/tcp": [ { "HostPort": "8081" } ] }
                },
                stop:   { /* extra options to docker stop   */ },
                kill:   { /* extra options to docker kill   */ }
              }
            }
          }

        }
      }
    }
  });


  var commands = {
    list:  { handler: require('./lib/list'),  description: 'List images/containers' },
    clean: { handler: require('./lib/clean'), description: 'Clean old images/containers' },
    build: { handler: require('./lib/build'), description: 'Build an image' },
    start: { handler: require('./lib/lifecycle').start, description: 'Start a container' },
    stop: { handler: require('./lib/lifecycle').stop, description: 'Stop a container' },
    restart: { handler: require('./lib/lifecycle').restart, description: 'Restart a container' },
    pause: { handler: require('./lib/lifecycle').pause, description: 'Pause a container' },
    unpause: { handler: require('./lib/lifecycle').unpause, description: 'Unpause a container' },
    kill: { handler: require('./lib/lifecycle').kill, description: 'Kill a container' },
  };

  /**
   * Grunt task depending on config.
   * 
   * @param  {String} command the command to execute
   * @param  {String} arg     The arg to the command
   */
  grunt.registerMultiTask('dock', 'Dock for docker', function(command, arg) {
    
    if (!arg)
      arg = 'default';

    if (!commands[command]) {
      grunt.fail.fatal('Command [' + command + '] not found.');
    }

    // Check arg
    if (typeof(commands[command].handler) != 'function') {
      if (!commands[command].handler[arg]) {
        grunt.fail.fatal('Argument [' + arg + '] for [' + command + '] not found.');
      }
    }

    var func = (arg) ? commands[command].handler[arg] : commands[command].handler;
    if (!func) func = commands[command].handler;

    var options = this.options();
    var docker = new Docker(options.docker);
    var done = this.async();
    
    func.apply(this, [grunt, docker, options, done, arg]);
  });

};