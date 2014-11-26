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
      // Apply to All
      options: {

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

      // Dev
      dev: {
        options: {

          images: {
            'node': {
              dockerfile: 'DockerNode',
              options: {
                build:  { /* extra options to docker build  */ },
                create: { /* extra options to docker create */ },
                start:  { 
                  "PortBindings": { "8080/tcp": [ { "HostPort": "8080" } ] },
                  "Binds":[__dirname + "/bundle/node:/bundle"]
                },
                stop:   { /* extra options to docker stop   */ },
                kill:   { /* extra options to docker kill   */ },
                logs:   { stdout: true }
              }
            },

            'nginx': {
              dockerfile: 'DockerNginx',
              options: {
                build:  { /* extra options to docker build  */ },
                create: { /* extra options to docker create */ },
                start:  {
                  "PortBindings": { "80/tcp": [ { "HostPort": "8081" } ] },
                  "Links": ["node:latest"],
                  "Binds":[
                    __dirname + "/bundle/nginx:/bundle",
                    __dirname + "/bundle/nginx:/etc/nginx/sites-available",
                  ]
                },
                stop:   { /* extra options to docker stop   */ },
                kill:   { /* extra options to docker kill   */ },
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