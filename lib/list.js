/* 
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */
var Docker = require('dockerode'),
    Table = require('easy-table'),
    utils = require('./utils');

var commands = {};

/**
 * List images.
 * 
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 */
commands['image'] = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options.docker);

  var done = this.async();

  var table = new Table();

  table.total('REPOSITORY', function accumulator (total) {
    total = total || 0;
    total ++;
    return total;
  }, function print (val, width) {
      var s = 'Total: ' + val;
      return s;
  });

  docker.listImages({all: false}, function(err, images) {

    if (err)
      grunt.fail.warn(err);

    if (images.length == 0) {
      grunt.log.ok('No image.');
      return done();
    }

    for (i in images) {
      for (j in images[i].RepoTags) {
        var repotag = utils.format('repotag', images[i].RepoTags[j]);
        table.cell('REPOSITORY', repotag.repository);
        table.cell('TAG', repotag.tag);
        table.cell('IMAGE ID', utils.format('id', images[i].Id));
        table.cell('CREATED', utils.format('date', images[i].Created));
        table.cell('VIRTUAL SIZE', utils.format('size', images[i].VirtualSize), Table.padLeft);
        table.newRow();
      }
    }
    grunt.log.writeln();
    grunt.log.writeln(table.toString());
    done();
  });
};

/**
 * List containers.
 * 
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 */
commands['container'] = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options.docker);

  var done = this.async();

  var table = new Table();

  table.total('CONTAINER ID', function accumulator (total) {
    total = total || 0;
    total ++;
    return total;
  }, function print (val, width) {
      var s = 'Total: ' + val;
      return s;
  });

  docker.listContainers({all: false}, function(err, containers) {
    if (err)
      grunt.fail.warn(err);

    if (containers.length == 0) {
      grunt.log.ok('No container.');
      return done();
    }

    for (i in containers) {
      table.cell('CONTAINER ID', utils.format('id', containers[i].Id));
      table.cell('IMAGE', containers[i].Image);
      table.cell('COMMAND', utils.format('command', containers[i].Command));
      table.cell('CREATED', utils.format('date', containers[i].Created));
      table.cell('STATUS', containers[i].Status);
      table.cell('PORTS', utils.format('ports', containers[i].Ports));
      table.cell('NAMES', utils.format('names', containers[i].Names));
      table.newRow();
    }
    grunt.log.writeln();
    grunt.log.writeln(table.toString());
    done();
  });
};


module.exports = commands;
