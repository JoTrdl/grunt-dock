/*
 * MIT License (MIT) - Copyright (c) 2014 Johann Troendle
 *
 * This file is part of <grunt-dock>.
 */
var fs = require('fs'),
    path = require('path'),
    tar = require('tar-stream'),
    tarfs = require('tar-fs'),
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
        jsonData.error && grunt.fail.warn(jsonData.error);
      });

      stream.on('error', callback);
      stream.on('end', function() {
        grunt.log.oklns('Build successfuly done.');
        callback();
      });
    });
  };

  var processDirectory = function(dirpath, buildOpts, callback) {
    grunt.log.debug('Packing directory [' + dirpath + ']');
    var pathentry = path.resolve(dirpath),
        dockerignore = pathentry + '/' +'.dockerignore',
        ignores = [];

    if (fs.statSync(dockerignore)) {
      grunt.log.debug('Detected a .dockerignore file, will perform ignoring tests');
      ignores = fs.readFileSync(dockerignore).toString().split("\n");
      ignores.push('.dockerignore');
    }

    tarfs.pack(pathentry, {
      ignore: function(name) {
        var relativeName = name.replace(pathentry + '/', ''),
            ignore = utils.shouldIgnore(ignores, relativeName);

        if (ignore) {
          grunt.log.debug('Ignoring file [' + relativeName +']');
        }
        
        return ignore;
      }
    }).pipe(zlib.createGzip())
      .pipe(concat(function (data) {
        build(data, buildOpts, callback);
      }));
  };


  var processFile = function(filepath, buildOpts, callback) {
    var content;
    try {
      content = fs.readFileSync(filepath);
    } catch(e) {
      return done(e);
    }
    var isTar = utils.isTarFile(filepath);
    switch(isTar) {
    case true:
      // The file is already a tar, build with it.
      build(content, buildOpts, callback);
      break;

    case false:
      // Compress the file before sending to docker
      var pack = tar.pack();
      pack.entry({ name:'Dockerfile' }, content);
      pack.finalize();

      pack.pipe(zlib.createGzip())
        .pipe(concat(function(data) {
          build(data, buildOpts, callback);
        }));

      break;
    }
  };

  // Process an image.
  // Determine if dockerfile option is directory or file.
  var process = function(tag, image, callback) {

    if (!image.dockerfile) { return callback(new Error('Dockerfile is null.')) };

    // Create the options object for the build
    var imageOptions = image.options || {};
    var buildOpts = utils.merge({t: tag}, imageOptions.build || {});

    var stats = fs.statSync(path.resolve(image.dockerfile));

    // Option 1: source is directory, pack it
    if (stats.isDirectory()) {
      processDirectory(image.dockerfile, buildOpts, callback);
    }
    else if (stats.isFile()) {
      processFile(image.dockerfile, buildOpts, callback);
    }
    else {
      return callback(new Error('Unsupported format.'));
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
