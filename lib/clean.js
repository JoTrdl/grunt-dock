var Docker = require('dockerode'),
    Table = require('easy-table'),
    utils = require('./utils');

var commands = {};

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
 * Clean images
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 */
commands['container'] = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options);

  var done = this.async();

  var imagesToDelete = [];
  var imagesData = {};

  docker.listContainers({all: true}, function(err, containers) {
    for (i in containers) {
     
      grunt.log.writeln(JSON.stringify(containers));
    }

    done();
    /*var i = -1;
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
      
      image.remove(function(e) {

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
    */
    
    
  });
};

module.exports = commands;