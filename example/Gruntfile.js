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
            'altar/dev': {
              dockerfile: 'Dockerfile',
              options: { 
                build:  { /* extra options to docker build  */ },
                create: { /* extra options to docker create */ },
                start:  { 
                  "Binds": ["/Users/lwcha_troendlj/Documents/altar:/bundle"],
                  "PortBindings": { "8080/tcp": [ { "HostPort": "8080" } ] }
                },
                stop:   { /* extra options to docker stop   */ },
                kill:   { /* extra options to docker kill   */ }
              }
            },

            'altar/dev2': {
              dockerfile: 'Dockerfile2',
              options: {
                build:  { /* extra options to docker build  */ },
                create: { /* extra options to docker create */ },
                start:  { 
                  "Binds": ["/Users/lwcha_troendlj/Documents/altar:/bundle"],
                  "PortBindings": { "8080/tcp": [ { "HostPort": "8081" } ] }
                },
                stop:   { /* extra options to docker stop   */ },
                kill:   { /* extra options to docker kill   */ }
              }
            }
          }

        }
      }
    }
  });
  
  require('../task/dock')(grunt);

};