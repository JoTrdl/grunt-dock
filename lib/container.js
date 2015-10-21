/* 
 * MIT License (MIT) - Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */
var async = require('async');
var utils = require('../lib/utils');

var commands = {};

/**
 * Start all containers. If tag is passed, start only the 'tag' image. Else,
 * start all configured images.
 * 
 * 'this' is the current task context.
 * 
 * @param {Object}
 *          grunt The Grunt Object
 * @param {Object}
 *          docker The Dockerode connection
 * @param {Object}
 *          options The Grunt options
 * @param {Function}
 *          done The done function to call when finished
 * @param {String}
 *          tag The image tag to start with or null
 */
commands.start = function(grunt, docker, options, done, tag) {

  // Start 1 container with image tag
  var startContainer = function(tag, confImage, callback) {

    grunt.log.subhead('Starting image [' + tag + ']');

    async.waterfall([

        // Step 1: search for a running container with the same image
        function(cb) {
          docker.listContainers({
            all : 1,
          // filters: '{"status":["running"]}'
          }, function(err, containers) {
            if (err) {
              return cb(err);
            }

            var container = null;

            for (var c = 0; c < containers.length; c++) {
              if (containers[c].Image.indexOf(utils.qualifiedImageName(tag,
                  options.registry, null)
                  + ':') === 0) {
                // If the current container is running or terminated
                if (utils.getContainerStatus(containers[c]) === "RUNNING"
                    || utils.getContainerStatus(containers[c]) === "STOPPED") {
                  container = containers[c];
                  break;
                }
              }
            }

            cb(null, container);
          });
        },

        // Step 2: if no running container, create a new one else kill it
        function(container, cb) {
          if (container) {
            var dockcontainer = docker.getContainer(container.Id);
            if (utils.getContainerStatus(container) === "RUNNING") {
              grunt.log
                  .writeln("Found a matched running container, killed it.");
              // Kill it
              dockcontainer.kill(function(e) {
                if (e) {
                  return callback(e);
                }
                cb(null, dockcontainer);
              });
            } else {
              cb(null, dockcontainer);
            }
          } else {
            // Create it
            grunt.log.writeln("No existing container, create a new one.");
            var opts = confImage && confImage.options
                && confImage.options.create || {};
            opts.Image = utils.qualifiedImageName(tag, options.registry,
                confImage && confImage.tag);
            opts.name = opts.name || tag;
            docker.createContainer(opts, cb);
          }
        },

        // Step 3: start the container
        function(dockcontainer, cb) {
          var opts = confImage && confImage.options && confImage.options.start
              || {};
          grunt.log.writeln("Starting container.");
          dockcontainer.start(opts, cb);
        } ], callback);

  }; // start container

  // Get tags to start

  var tags = Object.keys(options.images);

  if (tag && tag !== 'default') {
    tags = [ tag ];
  }

  // Loop for all tags.
  var i = 0;

  async.doWhilst(function(callback) {
    i++;
    var image = Object.keys(options.images)[i - 1];
    if (image) {
      startContainer(image, options.images[image], callback);
    }
  }, function() {
    return i < tags.length;
  }, function(e) {
    done(e);
  }); // do while tags

};

var actioning = {
  'stop' : 'Stopping',
  'restart' : 'Restarting',
  'pause' : 'Pausing',
  'unpause' : 'Unpausing',
  'kill' : 'Killing',
  'logs' : 'Printing logs'
};
/**
 * Lifecycle container.
 * 
 * 'this' is the current task context.
 * 
 * @param {Object}
 *          grunt The Grunt Object
 * @param {Object}
 *          docker The Dockerode connection
 * @param {Object}
 *          options The Grunt options
 * @param {Function}
 *          done The done function to call when finished
 * @param {String}
 *          tag The image tag to process with or null
 */
[ 'stop', 'restart', 'pause', 'unpause', 'kill', 'logs' ].forEach(function(
    action) {
  commands[action] = function(grunt, docker, options, done, tag) {

    // process 1 container with image tag
    var process = function(tag, confImage, callback) {

      grunt.log.subhead(actioning[action] + ' image [' + tag + ']');

      async.waterfall([

      // Step 1: search for a running container with the same image
      function(cb) {
        docker.listContainers({
          all : 1,
        // filters: (action !== 'unpause') ? '{"status":["running"]}' : null
        }, function(err, containers) {

          if (err) {
            return cb(err);
          }

          var container = null;

          for (var c = 0; c < containers.length; c++) {
            if (containers[c].Image.indexOf(tag + ':') === 0) {
              container = containers[c];
              break;
            }
          }

          cb(null, container);
        });
      },

      // Step 2: stop it
      function(container, cb) {
        if (container) {
          grunt.log.writeln("Found a matched container, " + action + " it.");

          var dockcontainer = docker.getContainer(container.Id);

          var opts = confImage.options && confImage.options[action] || {};
          dockcontainer[action](opts, function(e, stream) {
            if (stream && stream.readable) {
              stream.setEncoding('utf8');
              stream.on('error', cb);
              stream.on('end', cb);
              stream.on('data', grunt.log.write);
            } else {
              cb(e);
            }

          });
        } else {
          grunt.log.writeln("No matched container with this image.");
          cb(null);
        }
      }, ], callback);

    }; // stop container

    // Get tags
    var tags = Object.keys(options.images);
    if (tag && tag !== 'default') {
      tags = [ tag ];
    }

    // Loop for all tags.
    var i = 0;
    async.doWhilst(function(callback) {
      i++;
      var tag = tags[i - 1];
      var image = options.images[tag];
      tag = utils.qualifiedImageName(tag, options.registry, null);

      process(tag, image, callback);
    }, function() {
      return i < tags.length;
    }, function(e) {
      done(e);
    }); // do while tags

  };

});

module.exports = commands;