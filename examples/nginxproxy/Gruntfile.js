'use strict';


var fs = require('fs');


module.exports = function(grunt) {

  grunt.initConfig({
    dock: {
      // Apply to All
      options: {

        docker: {
          version: 'v1.15',
          protocol: 'https',
          host: '192.168.59.103',
          port: '2376',

          ca: fs.readFileSync('/Users/lwcha_troendlj/.boot2docker/certs/boot2docker-vm/ca.pem'),
          cert: fs.readFileSync('/Users/lwcha_troendlj/.boot2docker/certs/boot2docker-vm/cert.pem'),
          key: fs.readFileSync('/Users/lwcha_troendlj/.boot2docker/certs/boot2docker-vm/key.pem')
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
                  "PortBindings": { "8080/tcp": [ { "HostPort": "8080" } ] }
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