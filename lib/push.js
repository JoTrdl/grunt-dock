/*
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 *
 * This file is part of <grunt-dock>.
 */

var fs = require('fs'), path = require('path'), tar = require('tar-stream'), tarfs = require('tar-fs'), concat = require('concat-stream'), zlib = require('zlib'), async = require('async'), utils = require('./utils');

/**
 * Push the given image to a registry
 * 
 * @param {Object}
 *          grunt The Grunt Object
 * @param {Object}
 *          docker The Dockerode connection
 * @param {Object}
 *          options The Grunt options
 * @param {Function}
 *          done The done function to call when finished
 */
var pushCommand = function(grunt, docker, options, done) {
  // Pushes an image
  // NOTE: since it has to change the image name to please Dockerode, the name
  // of the image is saved in a property and then restored
  var pushImage = function(imageName, options, auth, callback) {

    var image = docker.getImage(imageName);
    image.nameBackup = image.name;
    image.name = options.repo;

    image.push(options, function(err, stream) {

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
    }, auth);
  };

  // Pushes all the images
  var imageNames = Object.keys(options.images);
  var auth = options.auth;
  var nImages = imageNames.length;

  imageNames.forEach(function(imageName) {

    var image = docker.getImage(imageName);
    pushImage(imageName, options.images[imageName].options.push,
        options.auth, function(err) {

          if (err) {
            return done(err);
          }

          if (--nImages == 0) {
            done();
          }
        });
  });

};

module.exports = pushCommand;
