/*
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 *
 * This file is part of <grunt-dock>.
 */

var utils = require('./utils');

/**
 * Runs a container from an image for one or more Docker clients
 * 
 * @param {Object}
 *          grunt The Grunt Object
 * @param {Object}
 *          docker The Dockerode connection (NOTE: ignored, it is here only to
 *          give any command the same signature)
 * @param {Object}
 *          options The Grunt options. It must include: image (the image name
 *          including the registry host and port, like), tag (the image tag),
 *          cmd (an array of commands to start the container). Optionally some
 *          more start options can be added as one see fit and they will be sent
 *          to the Docker remote API
 * @param {Function}
 *          done The done function to call when finished
 */
var runCommand = function(grunt, dockerIn, options, done) {

  // Creates a container
  var runImage = function(docker, imageName, repoTag, cmd, createOptions,
      startOptions, callback) {

    var hub = docker.run(repoTag, cmd, null, createOptions, startOptions,
        function(err, data, container) {
          if (err) {
            return callback(err);
          }

          grunt.log.oklns("Run successfuly done.");
          return callback();
        });

    hub.on("error", function(err) {
      grunt.log.oklns("Error");
      callback(err);
    });

    hub.on("stream", function(stream) {
      stream.on("data", function(data) {
        grunt.log.oklns("Container started: " + data);
        grunt.log.oklns("Run successfuly done.");
        callback();
      })
    });

    hub.on("container", function(container) {
      grunt.log.oklns("Container " + container.id + " created.");
    });
  };

  var imageNames = Object.keys(options.images);
  var Docker = require("dockerode");
  var nruns = 0;

  // Computes the number of runs that have to be performed
  imageNames.forEach(function(imageName) {
    var dockers = utils.composeRunOptions(options, imageName).docker;
    nruns += dockers.length;
  });

  // For all the docker clients
  imageNames.forEach(function(imageName) {

    var dockerOptions = utils.composeRunOptions(options, imageName);

    // Runs the current image for all the clients
    dockerOptions.docker.forEach(function(dockOpt) {

      var docker = new Docker(dockOpt);

      runImage(docker, imageName, dockerOptions.repo, dockerOptions.cmd,
          dockerOptions.create, dockerOptions.start, function(err) {
            if (err) {
              nruns = 0;
              return done(err);
            }

            if (--nruns == 0) {
              done();
            }
          });
    });
  });

};

module.exports = runCommand;
