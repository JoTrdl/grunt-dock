
var Docker = require('dockerode'),
    os = require('os'),
    fs = require('fs'),
    tar = require('tar'),
    utils = require('./utils');

var TMP_FILE =  'DockerFile_tmp.tar';

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

  var build = function() {
    docker.buildImage(TMP_FILE, {t: options.tag}, function(err, stream) {
      grunt.log.writeln('Start building image');

      if (err) {
        grunt.fail.warn('Caught error', err);
        grunt.fail.warn(err);
        done();
      }

      stream.setEncoding('utf8');

      stream.on('data', function(data) {
        var jsonData = JSON.parse(data);
        grunt.log.write(jsonData.stream);
      });

      stream.on('error', function() {
        grunt.fail.warn('Stream error.');
        done();
      });

      stream.on('end', function() {
        grunt.verbose.ok();
        done();
      });
    });
  };

  var tempFile = fs.createWriteStream(TMP_FILE)
    .on('error', function() {
      grunt.fail.warn('Stream write tar error.');
      done();
    })
    .on('end', function() {
      // Tar ended. Build.
      grunt.log.oklns("Tar successfuly done.");
      build();
    });

  // tar the file
  var packer = tar.Pack({ noProprietary: true })
    .on('error', function() {
      grunt.fail.warn('Stream tar error.');
      done();
    });
    
  packer.pipe(tempFile);

  var readStream = fs.createReadStream(options.dockerfile);
  readStream
    .on('open', function () {
      readStream.pipe(packer);
    })
    .on('error', function() {
      grunt.fail.warn('Failed to open the DockerFile.');
      done();
    });
  
};



module.exports = buildCommands;
