
var Docker = require('dockerode'),
    fs = require('fs'),
    path = require('path'),
    tar = require('tar-stream'),
    concat = require('concat-stream'),
    utils = require('./utils');

/**
 * Build an image
 * 'this' is the current task context.
 * 
 * @param  {Object} grunt The Grunt Object
 */
var buildCommands = function(grunt) {

  var options = this.options(utils.defaultOptions);
  var docker = new Docker(options);

  var done = this.async();

  var build = function(data) {
    docker.buildImage(data, {t: options.tag}, function(err, stream) {
      grunt.log.writeln('Start building image');

      if (err) {
        grunt.fail.warn('Caught error: ' + err);
      }

      stream.setEncoding('utf8');

      stream.on('data', function(data) {
        var jsonData = JSON.parse(data);
        grunt.log.write(jsonData.stream);
      });

      stream.on('error', function(e) {
        grunt.fail.warn('Stream error: ' + e);
      });

      stream.on('end', function() {
        grunt.log.ok('Dockerfile built.');
        done();
      });
    });
  };

  var fileExt = path.extname(options.dockerfil);
  if (fileExt) {
    var content = fs.readFileSync(options.dockerfile);
    build(content);
  } else {
    grunt.log.writeln('No extension detected, prepare a tar to send.');
    
    var content = fs.readFileSync(options.dockerfile);

    var pack = tar.pack();
    pack.entry({ name:'Dockerfile' }, content);
    pack.finalize();

    var zlib = require('zlib');
    pack.pipe(zlib.createGzip()).pipe(concat(function(data) {
      grunt.log.oklns("Tar successfuly done.");
      build(data);
    }));
  }

};



module.exports = buildCommands;
