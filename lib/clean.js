/* 
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */
var Table = require('easy-table'),
    async = require('async'),
    utils = require('./utils');

var commands = {};

/**
 * Clean images.
 * Get all images from Docker with filter 'dangling=true'.
 * Then remove them one by one.
 * 
 * 'this' is the current task context.
 * 
 * @param  {Object}   grunt   The Grunt Object
 * @param  {Object}   docker  The Dockerode connection
 * @param  {Object}   options The Grunt options
 * @param  {Function} done    The done function to call when finished
 */
commands.image = function(grunt, docker, options, done) {

  docker.listImages({all: 1, filters:'{"dangling":["true"]}'}, function(err, images) {
    if (err) {
      grunt.fail.warn(err);
    }

    if (images.length === 0) {
      grunt.log.ok('No image to clean.');
      return done();
    }

    var table = new Table();

    var process = function(image, callback) {
      var id = image.Id;
      var dockimage = docker.getImage(id);

      dockimage.remove({force:true}, function(e) {
        if (e) {
          return;
        }
        var repotag = utils.format('repotag', image.RepoTags[0]);
        table.cell('REPOSITORY', repotag.repository);
        table.cell('TAG', repotag.tag);
        table.cell('IMAGE ID', utils.format('id', image.Id));
        table.cell('CREATED', utils.format('date', image.Created));
        table.cell('VIRTUAL SIZE', utils.format('size', image.VirtualSize), Table.padLeft);
        table.newRow();
           
        callback();
      });
    };

    var i = 0;
  
    async.doWhilst(
      function (callback) {
        i ++;
        process(images[i-1], callback);
      },
      function () { return i < images.length; },
      function (e) {
        if (e) {
          grunt.fail.fatal(e);
        }

        grunt.log.writeln();
        grunt.log.writeln(table.toString());
        done();
      }
    ); // do while images

  });
};


/**
 * Clean containers.
 * Get all containers from Docker with status 'exited'.
 * Then remove them one by one.
 * 
 * 'this' is the current task context.
 * 
 * @param  {Object}   grunt   The Grunt Object
 * @param  {Object}   docker  The Dockerode connection
 * @param  {Object}   options The Grunt options
 * @param  {Function} done    The done function to call when finished
 */
commands.container = function(grunt, docker, options, done) {

  docker.listContainers({all: 1, filters:'{"status":["exited"]}'}, function(err, containers) {

    if (err) {
      grunt.fail.warn(err);
    }

    if (containers.length === 0) {
      grunt.log.ok('No container to clean.');
      return done();
    }

    var table = new Table();

    var process = function(container, callback) {
      var id = container.Id;
      var dockcontainer = docker.getContainer(id);

      dockcontainer.remove(function(e) {
        if (e) {
          return callback();
        }
        table.cell('CONTAINER ID', utils.format('id', container.Id));
        table.cell('IMAGE', container.Image);
        table.cell('COMMAND', utils.format('command', container.Command));
        table.cell('CREATED', utils.format('date', container.Created));
        table.cell('STATUS', container.Status);
        table.cell('NAMES', utils.format('names', container.Names));
        table.newRow();
           
        callback();
      });
    };

    var i = 0;
  
    async.doWhilst(
      function (callback) {
        i ++;
        process(containers[i-1], callback);
      },
      function () { return i < containers.length; },
      function (e) {
        if (e) {
          grunt.fail.fatal(e);
        }
        grunt.log.writeln();
        grunt.log.writeln(table.toString());
        done();
      }
    ); // do while containers
  });
};

/**
 * Default: clean all (images + containers)
 * 
 * 'this' is the current task context.
 * 
 * @param  {Object}   grunt   The Grunt Object
 * @param  {Object}   docker  The Dockerode connection
 * @param  {Object}   options The Grunt options
 * @param  {Function} done    The done function to call when finished
 */
commands.default = function(grunt, docker, options, done) {
  async.series([
    function(cb) {
      grunt.log.writeln('Images:');
      commands.image(grunt, docker, options, cb);
    },
    function(cb) {
      grunt.log.writeln('Containers:');
      commands.container(grunt, docker, options, cb);
    }], done);
};

module.exports = commands;
