/* 
 * MIT License (MIT) - Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */
var fs = require('fs'),
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
 * @param  {Object}   grunt   The Grunt Object
 * @param  {Object}   docker  The Dockerode connection
 * @param  {Object}   options The Grunt options
 * @param  {Function} done    The done function to call when finished
 * @param  {String}   tag     The image tag to work with or null
 */
var buildCommands = function(grunt, docker, options, done, tag) {

  // Build image with tag and its data/options.
  // Call callback when done or error.
  var build = function(data, options, callback) {
    grunt.log.subhead('Building image [' + options.t + ']');
    
    docker.buildImage(data, options, function(err, stream) {

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

    // Create the options object for the build
    var imageOptions = image.options || {};
    var buildOpts = utils.merge({t: tag}, imageOptions.build || {});

    var fileExt = path.extname(image.dockerfile);

    if (fileExt) {
      var content;

      try {
        content = fs.readFileSync(image.dockerfile);
      } catch (e) {
        return done(e);
      }

      build(content, buildOpts, callback);
    } else {
      tarfs.pack(path.dirname(path.resolve(image.dockerfile))).pipe(zlib.createGzip()).pipe(concat(function (data) {
        build(data, buildOpts, callback);
      }));
    }
  };

  var i = 0;
  
  var tags = Object.keys(options.images);
  if (tag && tag !== 'default') {
    tags = [tag];
  }

  async.doWhilst(
    function (callback) {
      i ++;
      var tag = tags[i-1];
      var image = options.images[tag];

      process(tag, image, callback);
    },
    function () { return i < tags.length; },
    function (e) {
      done(e);
    }
  ); // do while images
};

module.exports = buildCommands;
