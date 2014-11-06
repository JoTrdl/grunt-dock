/* 
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */
var Docker = require('dockerode'),
    Table = require('easy-table'),
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
 * @param  {Object} grunt The Grunt Object
 */
commands['image'] = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options.docker);

  var done = this.async();

  docker.listImages({all: true, filters:'{"dangling":["true"]}'}, function(err, images) {
    if (err)
      grunt.fail.warn(err);

    if (images.length == 0) {
      grunt.log.ok('No image to clean.');
      return done();
    }

    var table = new Table();

    var process = function(image, callback) {
      var id = image.Id;
      var dockimage = docker.getImage(id);

      dockimage.remove({force:true}, function(e) {
        if (e) return;
        var repotag = utils.format('repotag', image.RepoTags[0]);
        table.cell('REPOSITORY', repotag.repository);
        table.cell('TAG', repotag.tag);
        table.cell('IMAGE ID', utils.format('id', image.Id));
        table.cell('CREATED', utils.format('date', image.Created));
        table.cell('VIRTUAL SIZE', utils.format('size', image.VirtualSize));
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
        if (e) grunt.fail.fatal(e);
        
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
 * @param  {Object} grunt The Grunt Object
 */
commands['container'] = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options.docker);

  var done = this.async();

  docker.listContainers({all: true, filter:"{'status': 'exited'}"}, function(err, containers) {

    if (err)
      grunt.fail.warn(err);

    if (containers.length == 0) {
      grunt.log.ok('No container to clean.');
      return done();
    }

    var table = new Table();

    var process = function(container, callback) {
      var id = container.Id;
      var dockcontainer = docker.getContainer(id);

      dockcontainer.remove(function(e) {
        if (e) return;
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
        if (e) grunt.fail.fatal(e);

        grunt.log.writeln();
        grunt.log.writeln(table.toString());
        done();
      }
    ); // do while containers
  });
};

/**
 * Clean all: images + containers.
 * 
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 */
commands['all'] = function(grunt) {
  var target = this.target ? this.target + ':' : '';

  var tasks = [
    'dock:' + target + 'clean:container',
    'dock:' + target + 'clean:image',
  ]; 

  grunt.task.run(tasks);
};

module.exports = commands;
