/* 
 * MIT License (MIT) - Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */
var Docker = require('dockerode'),
    fs = require('fs'),
    path = require('path'),
    tar = require('tar-stream'),
    concat = require('concat-stream'),
    zlib = require('zlib'),
    async = require('async'),
    utils = require('./utils');

/**
 * Build images.
 * Each image is a content associated with its tag name.
 * The content can be a regular file or whatever for Docker.
 * In case of a plain file, it will be tar + gz before sent
 * to Docker.
 * 
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 */
var buildCommands = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options.docker);

  var done = this.async();

  // Build image with tag and its data/options.
  // Call callback when done or error.
  var build = function(data, options, callback) {
    docker.buildImage(data, options, function(err, stream) {
      grunt.log.subhead('Building image [' + options.t + ']');

      if (err) {
        return callback(err);
      }

      stream.setEncoding('utf8');

      stream.on('data', function(data) {
        var jsonData = JSON.parse(data);
        jsonData.stream && grunt.log.write(jsonData.stream);
      });

      stream.on('error', callback);
      stream.on('end', function() {
        grunt.log.oklns('Build successfuly done.');
        callback();
      });
    });
  };

  // Process image.
  // Tar + gz if plain content.
  var process = function(tag, image, callback) {

    var content;
    try {
      content = fs.readFileSync(image.dockerfile);
    } catch(e) {
      grunt.fail.warn('File not found [' + image.dockerfile + ']');
    }

    // Create the options object for the build
    var options = utils.merge({t: tag}, image.options || {});

    var fileExt = path.extname(image.dockerfile);
    if (fileExt) {
      build(content, options, callback);
    } 
    else {
      var pack = tar.pack();
      pack.entry({ name:'Dockerfile' }, content);
      pack.finalize();

      pack.pipe(zlib.createGzip()).pipe(concat(function(data) {
        build(data, options, callback);
      }));
    }
  };

  var i = 0;
  
  var tags = Object.keys(options.images);

  async.doWhilst(
    function (callback) {
      i ++;
      var tag = tags[i-1];
      var image = options.images[tag];

      process(tag, image, callback);
    },
    function () { return i < tags.length; },
    function (e) {

      if (e) grunt.fail.fatal(e);
      done();
    }
  ); // do while images
};

module.exports = buildCommands;
