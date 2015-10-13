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

    var image = docker.getImage(imageName);

    var hub = docker.run(image, cmd, null, createOptions, startOptions,
        function(err, data, container) {
console.log("XXX " + err); // XXX
          if (err) {
            return callback(err);
          }

          streamo.on("error", callback);

          streamo.on("data", function(data) {
            var jsonData = JSON.parse(data);
            if (jsonData && jsonData.error) {
              streamo.emit("error", jsonData.error);
            }
            jsonData.stream && grunt.log.write(jsonData.stream);
          });

        });

    hub.on("end", function() {
      grunt.log.oklns("Run successfuly done.");
      callback();
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
          dockerOptions.createOptions, dockerOptions.startOptions,
          function(err) {

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
