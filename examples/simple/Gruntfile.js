/* 
 * MIT License (MIT) - Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */

'use strict';


var fs = require('fs'),
    path = require('path'),
    utils = require('../../lib/utils');


module.exports = function(grunt) {

  var caPath   = path.resolve(utils.getUserHome(), '.boot2docker/certs/boot2docker-vm/', 'ca.pem'),
      certPath = path.resolve(utils.getUserHome(), '.boot2docker/certs/boot2docker-vm/', 'cert.pem'),
      keyPath  = path.resolve(utils.getUserHome(), '.boot2docker/certs/boot2docker-vm/', 'key.pem');

  grunt.initConfig({
    dock: {
    
      options: {

        // Docker connection options
        // For this example, assume it is a Boot2Docker config.
        // By default, Boot2Docker only accepts secure connection.
        docker: {
          protocol: 'https',
          host: '192.168.59.103',
          port: '2376',

          ca: fs.readFileSync(caPath),
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath)
        },
        
        images: {
          // The 'simple' image
          'simple': {
            // The Dockerfile to use
            dockerfile: './Dockerfile',

            // Options for dockerode
            options: {

              // When starting the container:
              // Bind the container port to the host (same port)
              // + 
              // Bind the './bundle' directory to the '/bundle' container one
              start:  {
                "PortBindings": { "8080/tcp": [ { "HostPort": "8080" } ] },
                "Binds":[__dirname + "/bundle:/bundle"]
              },

              // For the logs command, we want to display stdout
              logs: { stdout: true }
            }
          }
        }
      }
    }
  });
  
  require('../../tasks/dock')(grunt);
};
