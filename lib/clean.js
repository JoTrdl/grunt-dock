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
 * Clean images
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object

commands['image'] = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options);

  var done = this.async();

  docker.listImages({all: true, filter:"{'dangling': 'true'}"}, function(err, images) {
    if (err)
      grunt.fail.warn('Caught error: ' + err);

    if (images.length == 0) {
      grunt.log.ok('No image to clean.');
      return done();
    }

    var i = -1;
    var success = 0;
    var table = new Table();
    table.total('REPOSITORY:TAG', function accumulator (total) {
      total = total || 0;
      total ++;
      return total;
    }, function print (val, width) {
        var s = 'Total: ' + val + '\nCleaned: ' + success;
        return s;
    });

    function next() {

      i ++;

      var id = images[i].Id;
      var image = docker.getImage(id);
      
      image.remove({force:true}, function(e) {
        table.cell('REPOSITORY:TAG', images[i].RepoTags);
        table.cell('IMAGE ID', utils.format('id', id));
        if (e) {
          table.cell('STATUS', "Error");
          table.cell('REASON', e.reason);
        }
        else {
          table.cell('STATUS', "Done");
          success ++;
        }
        
        table.newRow();

        if (i == images.length - 1) {
            grunt.log.writeln();
            grunt.log.writeln(table.toString());
            grunt.log.ok('Cleaned');
            done();
        }
        else
          next();
      });
    }
    next(); // start iteration
  });
};
*/

/**
 * Clean images
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 */
commands['image'] = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options);

  var done = this.async();

  var imagesToDelete = [];
  var imagesData = {};

  docker.listImages({all: true}, function(err, images) {
    if (err)
      grunt.fail.warn('Caught error: ' + err);

    if (images.length == 0) {
      grunt.log.ok('No image to clean.');
      return done();
    }
    
    for (i in images) {
      for (j in images[i].RepoTags) {
        var repotag = utils.format('repotag', images[i].RepoTags[j]);
        if (repotag.repository == "<none>" && repotag.tag == "<none>") {
          imagesToDelete.push(images[i].Id);
          imagesData[images[i].Id] = images[i];
          imagesData[images[i].Id].RepoTags = images[i].RepoTags[j];
        }
      }
    }

    var i = -1;
    var success = 0;
    var table = new Table();
    table.total('REPOSITORY:TAG', function accumulator (total) {
      total = total || 0;
      total ++;
      return total;
    }, function print (val, width) {
        var s = 'Total: ' + val + '\nDeleted: ' + success;
        return s;
    });

    function next() {

      i ++;
      var id = imagesToDelete[i];
      var data = imagesData[id];
      var image = docker.getImage(id);
      
      image.remove({force:true}, function(e) {

        table.cell('REPOSITORY:TAG', data.RepoTags);
        table.cell('IMAGE ID', utils.format('id', id));
        if (e) {
          table.cell('STATUS', "Error");
          table.cell('REASON', e.reason);
        }
        else {
          table.cell('STATUS', "Done");
          success ++;
        }
        
        table.newRow();

        if (i == imagesToDelete.length - 1) {
            grunt.log.writeln();
            grunt.log.writeln(table.toString());
            grunt.verbose.ok();
            done();
        }
        else
          next();
      });
    }
    next(); // start iteration
  });
};

/**
 * Clean containers that have status 'exited'.
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 */
commands['container'] = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options);

  var done = this.async();

  docker.listContainers({all: true, filter:"{'status': 'exited'}"}, function(err, containers) {

    if (containers.length == 0) {
      grunt.log.ok('No container to clean.');
      return done();
    }

    var i = -1;
    var success = 0;
    
    var table = new Table();
    
    function next() {

      i ++;
      var id = containers[i].Id;
      var container = docker.getContainer(id);

      container.remove(function(e) {

        table.cell('CONTAINER ID', utils.format('id', containers[i].Id));
        table.cell('IMAGE', containers[i].Image);
        table.cell('COMMAND', utils.format('command', containers[i].Command));
        table.cell('CREATED', utils.format('date', containers[i].Created));
        table.cell('STATUS', containers[i].Status);
        table.cell('NAMES', utils.format('names', containers[i].Names));
        
        table.newRow();

        if (i == containers.length - 1) {
            grunt.log.writeln();
            grunt.log.writeln(table.toString());
            grunt.log.ok('Clean done.');
            done();
        }
        else
          next();
      });
    }
    next(); // start iteration

  });
};

/**
 * Clean all.
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