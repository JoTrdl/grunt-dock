/* 
 * MIT License (MIT) - Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */

'use strict';

var Docker = require('dockerode'),
    utils = require('../lib/utils');

module.exports = function(grunt) {

  var commands = utils.merge({
    list:  require('../lib/list'),
    clean: require('../lib/clean'),
    build: require('../lib/build'),
  }, require('../lib/container'));

  // Process the given command with arg.
  var processCommand = function(command, arg) {
    if (!arg) {
      arg = 'default';
    }

    if (!commands[command]) {
      grunt.fail.fatal('Command [' + command + '] not found.');
    }

    // Check arg
    if (typeof(commands[command]) !== 'function') {
      if (!commands[command][arg]) {
        grunt.fail.fatal('Argument [' + arg + '] for [' + command + '] not found.');
      }
    }

    var func = (arg) ? commands[command][arg] : commands[command];
    if (!func) {
      func = commands[command]; // fallback to the main function
    }

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
  };

  // For each command, create the grunt task
  Object.keys(commands).forEach(function(command) {
    grunt.task.registerTask('dock:' + command, function(arg) {

      // Fake the default Grunt this.options
      this.options = function(options) {
        var config = {};
        for (var name in grunt.config.data.dock.options) {
          config[name] = grunt.config.data.dock.options[name];
          if (!config[name]) config[name] = options[name]; 
        }
        return config;
      };
      
      processCommand.apply(this, [command, arg]);
    });
  });

  // Register the multi task
  grunt.registerMultiTask('dock', 'Dock for docker', processCommand);
};