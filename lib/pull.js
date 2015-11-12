/*
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 *
 * This file is part of <grunt-dock>.
 */

var fs = require('fs'), path = require('path'), tar = require('tar-stream'), tarfs = require('tar-fs'), concat = require('concat-stream'), zlib = require('zlib'), async = require('async'), utils = require('./utils');

/**
 * Pulls images from a registry for one or more Docker clients
 * 
 * @param {Object}
 *          grunt The Grunt Object
 * @param {Object}
 *          docker The Dockerode connection (NOTE: ignored, it is here only to
 *          give any command the same signature)
 * @param {Object}
 *          options The Grunt options. It must include: repo (the image name
 *          including the registry host and port, like ), tag (the image tag)
 * @param {Function}
 *          done The done function to call when finished
 */
var pullCommand = function(grunt, docker, options, done) {

  // Pulls an image
  var pullImage = function(docker, repoTag, callback) {

    docker.pull(repoTag, options, function(err, stream) {

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
        grunt.log.oklns("Pull successfuly done.");
        callback();
      });
    }, options.auth);
  };

  var imageNames = Object.keys(options.images);
  var Docker = require("dockerode");
  var npulls = 0;

  // Computes the number of pulls that have ot be performed
  imageNames.forEach(function(imageName) {
    var dockers = utils.composePullOptions(options, imageName).docker;
    npulls += dockers.length;
  });

  // For all the docker clients
  imageNames.forEach(function(imageName) {

    var dockerOptions = utils.composePullOptions(options, imageName);

    // Pulls the current image for all the clients
    dockerOptions.docker.forEach(function(dockOpt) {

      var docker = new Docker(dockOpt);

      pullImage(docker, dockerOptions.repo, function(err) {

        if (err) {
          npulls = 0;
          return done(err);
        }

        if (--npulls == 0) {
          done();
        }
      });
    });
  });

};

module.exports = pullCommand;
