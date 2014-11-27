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
          version: 'v1.15',
          protocol: 'https',
          host: '192.168.59.103',
          port: '2376',

          ca: fs.readFileSync(caPath),
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath)
        }
        
      },

      // For this sample, we will use a dev target
      dev: {
        options: {

          // Docker images definition
          images: {

            // The Node.js container
            'node': {
              // The Dockerfile to use
              dockerfile: 'DockerNode',

              options: {
                
                // A startup, bind the 8080 port to the host
                // Bind the directory 'bundle/node' into the directory container '/bundle'
                start:  { 
                  "PortBindings": { "8080/tcp": [ { "HostPort": "8080" } ] },
                  "Binds":[__dirname + "/bundle/node:/bundle"]
                },

                // For logs, only stdout
                logs:   { stdout: true }
              }
            },

            // The NGINX container
            'nginx': {
              // The Dockerfile to use
              dockerfile: 'DockerNginx',

              options: {

                // Bind the 80 port to the host 8081
                // Links this container to the node one. So Docker env variable will be accessible
                // Bind 2 directories to the container (config, NGINX startup script, default index.html file)
                start:  {
                  "PortBindings": { "80/tcp": [ { "HostPort": "8081" } ] },
                  "Links": ["node:latest"],
                  "Binds":[
                    __dirname + "/bundle/nginx:/bundle",
                    __dirname + "/bundle/nginx:/etc/nginx/sites-available",
                  ]
                },
                // For logs, sdtout & stderr
                logs:   { stdout: true, stderr: true }
              }
            }
          }

        }
      }
    }
  });
  
  require('../../task/dock')(grunt);

};
