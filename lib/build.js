
var Docker = require('dockerode'),
    os = require('os'),
    fs = require('fs'),
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
        console.log(err)
        grunt.fail.warn('Caught error: ', err);
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

  var content = fs.readFileSync(options.dockerfile);

  var pack = tar.pack();
  pack.entry({name: 'DockerFile', size: content.length, uid: '500', gid: '20', uname: 'toto', gname: 'toto'}, content, function() {
    pack.finalize();
  });
  pack.pipe(concat(function(data) {
    grunt.log.oklns("Tar successfuly done.");
    fs.writeFileSync('test.tar', data);
    build(data);
  }));

};



module.exports = buildCommands;
