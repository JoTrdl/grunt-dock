/* 
 * MIT License (MIT) - Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */
var Docker = require('dockerode'),
    async = require('async'),
    utils = require('./utils');

var commands = {};

/**
 * Start all containers.
 * If tag is passed, start only the 'tag' image.
 * Else, start all configured images.
 * 
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 * @param  {String} tag   The image tag to start with or null
 */
commands['start'] = function(grunt, tag) {
  
  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options.docker);
  
  var done = this.async();

  // Start 1 container with image tag
  var startContainer = function(tag, confImage, callback) {

    grunt.log.subhead('Starting image [' + tag + ']');

    async.waterfall([

      // Step 1: search for a running container with the same image
      function(cb) {
        docker.listContainers({
          all: 1, 
          filters: '{"status":["running"]}'}, 
          function(err, containers) {

          if (err)
            return cb(err);

          var container = null;

          for (c in containers) {
            if (containers[c].Image.indexOf(tag + ':') == 0) {
              container = containers[c];
              break;
            }
          }

          cb(null, container);
        });
      },

      // Step 2: if no running container, create a new one else kill it
      function(container, cb) {
        if (container) {
          grunt.log.writeln("Found a matched container, kill it.");
          // Kill it
          var dockcontainer = docker.getContainer(container.Id);
          dockcontainer.kill(function(e) {
            if (e) return callback(e);
            cb(null, dockcontainer);
          });
        }
        else {
          // Create it
          grunt.log.writeln("No existing container, create a new one.");
          docker.createContainer({Image: tag}, cb);
        }
      },

      // Step 3: start the container
      function(dockcontainer, cb) {
        var opts = confImage.options.start || {};
        grunt.log.writeln("Starting container.");
        dockcontainer.start(opts, cb);
      }
    ], callback);

  }; // start container

  // Get tags to start
  var tags = Object.keys(options.images);
  if (tag && tag != '')
    tags = [tag];

    
  // Loop for all tags.
  var i = 0;
  async.doWhilst(
    function (callback) {
      i ++;
      var tag = tags[i-1];
      var image = options.images[tag];

      startContainer(tag, image, callback);
    },
    function () { return i < tags.length; },
    function (e) {

      if (e) grunt.fail.fatal(e);
      done();
    }
  ); // do while tags
  
};

module.exports = commands;
