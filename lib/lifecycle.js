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
 * Start one or all containers.
 * If tag is passed, start only the 'tag' image.
 * Else, start all configured images.
 * 
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 * @param  {Object} tag   The image tag to start with or null
 */
commands['start'] = function(grunt, tag) {
  
  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options.docker);
  
  var done = this.async();

  // Start 1 container with image tag
  var startContainer = function(tag, options, callback) {

    grunt.log.subhead('Starting image [' + tag + ']');

    async.waterfall([

      // Step 1: search for a running container with the same image
      function(cb) {
        var container = null;
        cb(null, container);
      },

      // Step 2: if no running container, create a new one else kill it
      function(container, cb) {
          
        cb(null, container);
      },

      // Step 3: start the container
      function(container, cb) {
          
        cb(null);
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
