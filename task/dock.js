/* 
 * MIT License (MIT) - Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */

'use strict';

var Docker = require('dockerode');

module.exports = function(grunt) {

 var commands = {
    list:  { handler: require('../lib/list'),  description: 'List images/containers' },
    clean: { handler: require('../lib/clean'), description: 'Clean old images/containers' },
    build: { handler: require('../lib/build'), description: 'Build an image' },
    start: { handler: require('../lib/lifecycle').start, description: 'Start a container' },
    stop: { handler: require('../lib/lifecycle').stop, description: 'Stop a container' },
    restart: { handler: require('../lib/lifecycle').restart, description: 'Restart a container' },
    pause: { handler: require('../lib/lifecycle').pause, description: 'Pause a container' },
    unpause: { handler: require('../lib/lifecycle').unpause, description: 'Unpause a container' },
    kill: { handler: require('../lib/lifecycle').kill, description: 'Kill a container' },
  };

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
    
    var callback = function(e) {
      if (e) {
        grunt.fail.warn(e);
      }
      done();
    };

    func.apply(this, [grunt, docker, options, callback, arg]);
  });

};