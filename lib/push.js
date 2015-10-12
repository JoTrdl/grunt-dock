/*
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 *
 * This file is part of <grunt-dock>.
 */

var utils = require("./utils");
var Docker = require("dockerode");

/**
 * Push the given image to a registry
 * 
 * @param {Object}
 *          grunt The Grunt Object
 * @param {Object}
 *          dockerIn The Dockerode connection
 * @param {Object}
 *          options The Grunt options
 * @param {Function}
 *          done The done function to call when finished
 */
var pushCommand = function(grunt, docker, options, done) {

  // Pushes an image
  // NOTE: since it has to change the image name to please Dockerode, the name
  // of the image is saved in a property and then restored
  var pushImage = function(imageName, options, callback) {

    var pushOptions = utils.composePushOptions(options, imageName);
    var image = docker.getImage(imageName);
    image.nameBackup = image.name;
    image.name = pushOptions.name;

    image.push(pushOptions, function(err, stream) {

      image.name = image.nameBackup;
      delete image.nameBackup;

      if (err) {
        return callback(err);
      }

      stream.setEncoding("utf8");
      stream.on("error", callback);

      stream.on("data", function(data) {
        var jsonData = JSON.parse(data);
        if (jsonData && jsonData.error) {
          stream.emit("error", jsonData.error);
        }
        jsonData.stream && grunt.log.write(jsonData.stream);
      });

      stream.on("end", function() {
        grunt.log.oklns("Push successfuly done.");
        callback();
      });
    }, options.auth);
  };

  // Computes the number of pushes that have to be performed
  var imageNames = Object.keys(options.images);
  var npushes = imageNames.length;

  // Pushes the images to the docker client and calls the callback once all of
  // them have been pushed
  imageNames.forEach(function(imageName) {
    pushImage(imageName, options, function(err) {

      if (err) {
        npushes = 0;
        return done(err);
      }

      if (--npushes == 0) {
        done();
      }
    });
  });

};

module.exports = pushCommand;
