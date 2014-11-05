
var Docker = require('dockerode'),
    Table = require('easy-table'),
    utils = require('./utils');

var commands = {};

/**
 * List images
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 */
commands['image'] = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options);

  var done = this.async();

  var t = new Table();

  t.total('REPOSITORY', function accumulator (total) {
    total = total || 0;
    total ++;
    return total;
  }, function print (val, width) {
      var s = 'Total: ' + val;
      return s;
  });

  docker.listImages({all: false}, function(err, images) {

    if (err)
      grunt.fail.warn('Caught error: ' + err);

    if (images.length == 0) {
      grunt.log.ok('No image.');
      return done();
    }

    for (i in images) {
      for (j in images[i].RepoTags) {
        var repotag = utils.format('repotag', images[i].RepoTags[j]);
        t.cell('REPOSITORY', repotag.repository);
        t.cell('TAG', repotag.tag);
        t.cell('IMAGE ID', utils.format('id', images[i].Id));
        t.cell('CREATED', utils.format('date', images[i].Created));
        t.cell('VIRTUAL SIZE', utils.format('size', images[i].VirtualSize));
        t.newRow();
      }
    }
    grunt.log.writeln();
    grunt.log.writeln(t.toString());
    done();
  });
};

/**
 * List containers
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 */
commands['container'] = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options);

  var done = this.async();

  var t = new Table();

  t.total('CONTAINER ID', function accumulator (total) {
    total = total || 0;
    total ++;
    return total;
  }, function print (val, width) {
      var s = 'Total: ' + val;
      return s;
  });

  docker.listContainers({all: false}, function(err, containers) {
    if (err)
      grunt.fail.warn('Caught error: ' + err);

    if (containers.length == 0) {
      grunt.log.ok('No container.');
      return done();
    }

    for (i in containers) {
      t.cell('CONTAINER ID', utils.format('id', containers[i].Id));
      t.cell('IMAGE', containers[i].Image);
      t.cell('COMMAND', utils.format('command', containers[i].Command));
      t.cell('CREATED', utils.format('date', containers[i].Created));
      t.cell('STATUS', containers[i].Status);
      t.cell('PORTS', utils.format('ports', containers[i].Ports));
      t.cell('NAMES', utils.format('names', containers[i].Names));
      t.newRow();
    }
    grunt.log.writeln();
    grunt.log.writeln(t.toString());
    done();
  });
};


module.exports = commands;
