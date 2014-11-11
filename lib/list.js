/* 
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */
var async = require('async'),
    Table = require('easy-table'),
    utils = require('./utils');

var commands = {};

/**
 * Common total options for easy-table
 * @type {Object}
 */
var tableOptions = {
  accumulator: function(total) {
    total = total || 0;
    total ++;
    return total;
  },
  print: function(val) {
    return 'Total: ' + val;
  }
};

/**
 * List images.
 * 
 * @param  {Object}   grunt   The Grunt Object
 * @param  {Object}   docker  The Dockerode connection
 * @param  {Object}   options The Grunt options
 * @param  {Function} done    The done function to call when finished
 */
commands['image'] = function(grunt, docker, options, done, arg) {

  var table = new Table();

  table.total('REPOSITORY', tableOptions.accumulator, tableOptions.print);

  docker.listImages({all: true}, function(err, images) {

    if (err) {
      grunt.fail.warn(err);
    }
      
    if (images.length === 0) {
      grunt.log.ok('No image.');
      return done();
    }

    for (var i = 0; i < images.length; i++) {
      for (var j = 0; j < images[i].RepoTags.length; j++) {
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
 * @param  {Object}   grunt   The Grunt Object
 * @param  {Object}   docker  The Dockerode connection
 * @param  {Object}   options The Grunt options
 * @param  {Function} done    The done function to call when finished
 */
commands['container'] = function(grunt, docker, options, done, arg) {

  var table = new Table();

  table.total('CONTAINER ID', tableOptions.accumulator, tableOptions.print);

  docker.listContainers({all: true}, function(err, containers) {
    if (err) {
      grunt.fail.warn(err);
    }
      
    if (containers.length === 0) {
      grunt.log.ok('No container.');
      return done();
    }

    for (var i = 0; i < containers.length; i ++) {
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

/**
 * Default: list images then containers 
 * 
 * @param  {Object}   grunt   The Grunt Object
 * @param  {Object}   docker  The Dockerode connection
 * @param  {Object}   options The Grunt options
 * @param  {Function} done    The done function to call when finished
 */
commands['default'] = function(grunt, docker, options, done, arg) {
  async.series([
    function(cb) {
      grunt.log.writeln('Images:');
      commands['image'](grunt, docker, options, cb);
    },
    function(cb) {
      grunt.log.writeln('Containers:');
      commands['container'](grunt, docker, options, cb);
    }], done);
};

module.exports = commands;
